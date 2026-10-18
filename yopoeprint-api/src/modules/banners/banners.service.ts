import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { Repository, In } from 'typeorm'
import { Banner } from './banner.entity'
import { CreateBannerDto, UpdateBannerDto, BANNER_FORMATS, BannerVariant } from './banner.dto'
import { CloudinaryService } from '../upload/cloudinary.service'
import { UploadedFileData, validateUploadedFile, IMAGE_FILE_KINDS } from '../upload/file-validation'
import { readImageSize } from '../upload/image-dimensions'

// Contrat lu par la boutique (src/lib/banners.service.ts) et l'admin
export interface BannerView {
  id: string
  title: string
  subtitle: string | null
  badge: string | null
  ctaLabel: string | null
  altText: string | null
  imageUrl: string
  mobileImageUrl: string | null
  linkUrl: string
  order: number
  active: boolean
  startDate: string | null
  endDate: string | null
}

const toView = (b: Banner): BannerView => ({
  id: b.id,
  title: b.title,
  subtitle: b.subtitle,
  badge: b.badge,
  ctaLabel: b.ctaLabel,
  altText: b.altText,
  imageUrl: b.imageUrl,
  mobileImageUrl: b.mobileImageUrl,
  linkUrl: b.linkUrl,
  order: b.position,
  active: b.isActive,
  startDate: b.startsAt ? b.startsAt.toISOString() : null,
  endDate: b.endsAt ? b.endsAt.toISOString() : null,
})

const VARIANT_LABEL: Record<BannerVariant, string> = { desktop: 'ordinateur', mobile: 'téléphone' }

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner) private repo: Repository<Banner>,
    private cloudinary: CloudinaryService,
    private config: ConfigService,
  ) {}

  /** Bannières visibles maintenant sur la boutique (actives et dans leur période de diffusion). */
  async listPublic(): Promise<BannerView[]> {
    const rows = await this.repo.createQueryBuilder('b')
      .where('b.is_active = true')
      .andWhere('(b.starts_at IS NULL OR b.starts_at <= now())')
      .andWhere('(b.ends_at IS NULL OR b.ends_at > now())')
      .orderBy('b.position', 'ASC')
      .addOrderBy('b.created_at', 'ASC')
      .getMany()
    return rows.map(toView)
  }

  async listAll(): Promise<BannerView[]> {
    const rows = await this.repo.find({ order: { position: 'ASC', createdAt: 'ASC' } })
    return rows.map(toView)
  }

  /**
   * Contrôle les dimensions exactes avant tout envoi à Cloudinary, puis range le fichier
   * dans le dossier de sa variante : seules ces URL sont ensuite acceptées sur une bannière.
   */
  async uploadImage(file: UploadedFileData | undefined, variant: BannerVariant) {
    validateUploadedFile(file, IMAGE_FILE_KINDS)
    const expected = BANNER_FORMATS[variant]
    const size = readImageSize(file!.buffer)
    if (!size) throw new BadRequestException('Dimensions de l\'image illisibles : enregistrez-la en JPG ou PNG standard')
    if (size.width !== expected.width || size.height !== expected.height) {
      throw new BadRequestException(
        `L'image ${VARIANT_LABEL[variant]} doit mesurer exactement ${expected.width} × ${expected.height} px ` +
        `(reçue : ${size.width} × ${size.height} px)`,
      )
    }
    const result = await this.cloudinary.upload(file!.buffer, {
      folder: `yopoeprint/banners/${variant}`,
      filename: file!.originalname,
      resourceType: 'image',
    })
    return { url: result.url, width: size.width, height: size.height, variant }
  }

  async create(dto: CreateBannerDto): Promise<BannerView> {
    this.assertImage(dto.imageUrl, 'desktop')
    if (dto.mobileImageUrl) this.assertImage(dto.mobileImageUrl, 'mobile')
    const startsAt = dto.startDate ? new Date(dto.startDate) : null
    const endsAt = dto.endDate ? new Date(dto.endDate) : null
    this.assertPeriod(startsAt, endsAt)

    const last = await this.repo.createQueryBuilder('b').select('MAX(b.position)', 'max').getRawOne()
    const banner = this.repo.create({
      title: dto.title,
      subtitle: dto.subtitle ?? null,
      badge: dto.badge ?? null,
      ctaLabel: dto.ctaLabel ?? null,
      altText: dto.altText ?? null,
      imageUrl: dto.imageUrl,
      mobileImageUrl: dto.mobileImageUrl ?? null,
      linkUrl: dto.linkUrl,
      isActive: dto.active ?? true,
      startsAt,
      endsAt,
      position: (Number(last?.max) || 0) + 1,
    })
    return toView(await this.repo.save(banner))
  }

  async update(id: string, dto: UpdateBannerDto): Promise<BannerView> {
    const banner = await this.findOne(id)
    // Seule une image remplacée est contrôlée : l'admin renvoie aussi les images inchangées
    if (dto.imageUrl !== undefined && dto.imageUrl !== banner.imageUrl) {
      this.assertImage(dto.imageUrl, 'desktop')
      banner.imageUrl = dto.imageUrl
    }
    if (dto.mobileImageUrl !== undefined && dto.mobileImageUrl !== banner.mobileImageUrl) {
      if (dto.mobileImageUrl) this.assertImage(dto.mobileImageUrl, 'mobile')
      banner.mobileImageUrl = dto.mobileImageUrl || null
    }
    if (dto.title !== undefined) banner.title = dto.title
    if (dto.subtitle !== undefined) banner.subtitle = dto.subtitle ?? null
    if (dto.badge !== undefined) banner.badge = dto.badge ?? null
    if (dto.ctaLabel !== undefined) banner.ctaLabel = dto.ctaLabel ?? null
    if (dto.altText !== undefined) banner.altText = dto.altText ?? null
    if (dto.linkUrl !== undefined) banner.linkUrl = dto.linkUrl
    if (dto.active !== undefined) banner.isActive = dto.active
    if (dto.startDate !== undefined) banner.startsAt = dto.startDate ? new Date(dto.startDate) : null
    if (dto.endDate !== undefined) banner.endsAt = dto.endDate ? new Date(dto.endDate) : null
    this.assertPeriod(banner.startsAt, banner.endsAt)
    return toView(await this.repo.save(banner))
  }

  async remove(id: string) {
    const banner = await this.findOne(id)
    await this.repo.remove(banner)
    return { id, deleted: true }
  }

  /** Réordonne les bannières selon la liste reçue (toutes doivent y figurer). */
  async reorder(ids: string[]): Promise<BannerView[]> {
    const total = await this.repo.count()
    const found = await this.repo.findBy({ id: In(ids) })
    if (new Set(ids).size !== ids.length || found.length !== ids.length || ids.length !== total) {
      throw new BadRequestException('La liste doit contenir chaque bannière une seule fois')
    }
    await this.repo.manager.transaction(async (em) => {
      for (const [i, id] of ids.entries()) await em.update(Banner, { id }, { position: i + 1 })
    })
    return this.listAll()
  }

  private async findOne(id: string) {
    const banner = await this.repo.findOne({ where: { id } })
    if (!banner) throw new NotFoundException('Bannière introuvable')
    return banner
  }

  // Seules les images passées par uploadImage (dimensions contrôlées, sans transformation) sont acceptées
  private assertImage(url: string, variant: BannerVariant) {
    const cloud = this.config.get<string>('cloudinary.cloudName') || ''
    const escaped = cloud.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(
      `^https://res\\.cloudinary\\.com/${escaped}/image/upload/v\\d+/yopoeprint/banners/${variant}/[^/?#\\s]+\\.(jpe?g|png)$`, 'i',
    )
    if (!cloud || !pattern.test(url)) {
      const { width, height } = BANNER_FORMATS[variant]
      throw new BadRequestException(
        `L'image ${VARIANT_LABEL[variant]} doit être envoyée depuis l'admin (format exact ${width} × ${height} px)`,
      )
    }
  }

  private assertPeriod(startsAt: Date | null, endsAt: Date | null) {
    if (startsAt && endsAt && endsAt <= startsAt) {
      throw new BadRequestException('La date de fin doit suivre la date de début')
    }
  }
}
