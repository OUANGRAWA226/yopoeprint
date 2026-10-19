import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PlatformSettingsRow } from './platform-settings.entity'
import { DEFAULT_SETTINGS, PlatformSettings, DeliveryZoneSetting, ResellerTierSetting } from './settings.types'
import { UpdateSettingsDto } from './settings.dto'

const CACHE_MS = 30_000

@Injectable()
export class SettingsService {
  private cache: { value: PlatformSettings; at: number } | null = null

  constructor(
    @InjectRepository(PlatformSettingsRow)
    private repo: Repository<PlatformSettingsRow>,
  ) {}

  // Ligne unique (id = 1) ; complétée par les valeurs par défaut pour toute clé absente
  async get(): Promise<PlatformSettings> {
    if (this.cache && Date.now() - this.cache.at < CACHE_MS) return this.cache.value
    const row = await this.repo.findOne({ where: { id: 1 } })
    const data = (row?.data || {}) as Partial<PlatformSettings>
    const value: PlatformSettings = {
      contact: { ...DEFAULT_SETTINGS.contact, ...(data.contact || {}) },
      delivery: { ...DEFAULT_SETTINGS.delivery, ...(data.delivery || {}) },
      resellerTiers: data.resellerTiers?.length ? data.resellerTiers : DEFAULT_SETTINGS.resellerTiers,
      maintenance: { ...DEFAULT_SETTINGS.maintenance, ...(data.maintenance || {}) },
      legal: { ...DEFAULT_SETTINGS.legal, ...(data.legal || {}) },
    }
    this.cache = { value, at: Date.now() }
    return value
  }

  async getWithMeta() {
    const row = await this.repo.findOne({ where: { id: 1 } })
    return { settings: await this.get(), updatedAt: row?.updatedAt || null, updatedBy: row?.updatedBy || null }
  }

  // Ce que la boutique a besoin de connaître (aucune donnée sensible)
  async getPublic() {
    const s = await this.get()
    return {
      contact: s.contact,
      delivery: { freeThreshold: s.delivery.freeThreshold, zones: s.delivery.zones.filter((z) => z.enabled) },
      resellerTiers: s.resellerTiers,
      maintenance: s.maintenance,
      legal: s.legal,
    }
  }

  async update(dto: UpdateSettingsDto, actorId: string) {
    const zoneIds = dto.delivery.zones.map((z) => z.id)
    if (new Set(zoneIds).size !== zoneIds.length) throw new BadRequestException('Deux zones de livraison ont le même identifiant')
    if (!dto.delivery.zones.some((z) => z.enabled)) throw new BadRequestException('Au moins une zone de livraison doit rester active')

    const tiers = [...dto.resellerTiers].sort((a, b) => a.minRevenue - b.minRevenue)
    const tierIds = tiers.map((t) => t.id)
    if (new Set(tierIds).size !== tierIds.length) throw new BadRequestException('Deux paliers revendeurs ont le même identifiant')
    if (tiers[0].minRevenue !== 0) throw new BadRequestException('Le premier palier revendeur doit commencer à 0 FCFA')
    if (tiers.some((t, i) => i > 0 && t.rate < tiers[i - 1].rate)) {
      throw new BadRequestException('La remise doit augmenter avec le palier')
    }

    const current = await this.get()
    const data: PlatformSettings = {
      contact: { ...dto.contact },
      delivery: { freeThreshold: dto.delivery.freeThreshold, zones: dto.delivery.zones.map((z) => ({ ...z })) },
      resellerTiers: tiers.map((t) => ({ ...t })),
      maintenance: { ...dto.maintenance },
      // Section facultative : un enregistrement sans elle conserve les mentions existantes
      legal: dto.legal ? { ...dto.legal } : current.legal,
    }
    await this.repo.save({ id: 1, data: data as unknown as Record<string, unknown>, updatedBy: actorId })
    this.cache = null
    return this.getWithMeta()
  }

  // ─── Utilitaires métier ───────────────────────────────────
  async findZone(id: string): Promise<DeliveryZoneSetting | null> {
    const s = await this.get()
    return s.delivery.zones.find((z) => z.id === id && z.enabled) || null
  }

  async deliveryCost(zone: DeliveryZoneSetting, subtotal: number) {
    const s = await this.get()
    const free = s.delivery.freeThreshold > 0 && subtotal >= s.delivery.freeThreshold && zone.freeEligible
    return free ? 0 : zone.price
  }

  async resellerTiers(): Promise<ResellerTierSetting[]> {
    return [...(await this.get()).resellerTiers].sort((a, b) => a.minRevenue - b.minRevenue)
  }
}
