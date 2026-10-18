import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like, FindManyOptions } from 'typeorm'
import { Product } from './product.entity'
import {
  CreateProductDto, UpdateProductDto, PatchProductDto,
  ProductQueryDto, CalculatePriceDto,
} from './product.dto'

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  // ─── Get all products (public) ────────────────────────────
  async findAll(query: ProductQueryDto, includeInactive = false) {
    const page  = parseInt(query.page  || '1', 10)
    const limit = parseInt(query.limit || '12', 10)
    const skip  = (page - 1) * limit

    const where: any = includeInactive ? {} : { isActive: true }

    if (query.category) where.category = query.category

    const options: FindManyOptions<Product> = {
      where,
      skip,
      take: limit,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    }

    // Search by name
    if (query.search) {
      options.where = [
        { ...where, name: Like(`%${query.search}%`) },
        { ...where, shortDesc: Like(`%${query.search}%`) },
      ]
    }

    const [data, total] = await this.productRepo.findAndCount(options)

    return {
      data,
      total,
      page,
      limit,
      hasMore: skip + data.length < total,
    }
  }

  // ─── Get popular products ─────────────────────────────────
  async findPopular(limit = 8) {
    return this.productRepo.find({
      where: { isActive: true, isPopular: true },
      take: limit,
      order: { sortOrder: 'ASC' },
    })
  }

  // ─── Get one product by slug ──────────────────────────────
  async findBySlug(slug: string) {
    const product = await this.productRepo.findOne({ where: { slug, isActive: true } })
    if (!product) throw new NotFoundException(`Produit "${slug}" introuvable`)
    return product
  }

  // ─── Get one product by ID ────────────────────────────────
  async findById(id: string) {
    const product = await this.productRepo.findOne({ where: { id } })
    if (!product) throw new NotFoundException('Produit introuvable')
    return product
  }

  // ─── Create product (admin) ───────────────────────────────
  async create(dto: CreateProductDto) {
    const existing = await this.productRepo.findOne({ where: { slug: dto.slug } })
    if (existing) throw new ConflictException('Un produit avec ce slug existe déjà')

    const product = this.productRepo.create(dto)
    return this.productRepo.save(product)
  }

  // ─── Update product (admin) ───────────────────────────────
  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id) // ensure exists
    await this.productRepo.update(id, dto)
    return this.findById(id)
  }

  // ─── Partial update + activation (admin, PATCH) ───────────
  async patch(id: string, dto: PatchProductDto) {
    const { active, isActive, ...fields } = dto
    const product = await this.findById(id)

    if (fields.slug && fields.slug !== product.slug) {
      const existing = await this.productRepo.findOne({ where: { slug: fields.slug } })
      if (existing) throw new ConflictException('Un produit avec ce slug existe déjà')
    }

    const changes: Partial<Product> = { ...fields } as Partial<Product>
    const nextActive = isActive ?? active
    if (nextActive !== undefined) changes.isActive = nextActive

    if (Object.keys(changes).length) await this.productRepo.update(id, changes)
    return this.findById(id)
  }

  // ─── Soft delete (admin) ──────────────────────────────────
  // Les commandes gardent un instantané des articles : on désactive au lieu de supprimer.
  async softDelete(id: string) {
    await this.findById(id)
    await this.productRepo.update(id, { isActive: false })
    return { message: 'Produit désactivé (retiré du catalogue)' }
  }

  // ─── Image principale (admin) ─────────────────────────────
  async setImage(id: string, imageUrl: string) {
    await this.findById(id)
    await this.productRepo.update(id, { imageUrl })
    return { imageUrl }
  }

  // ─── Toggle active status ─────────────────────────────────
  async toggleActive(id: string) {
    const product = await this.findById(id)
    await this.productRepo.update(id, { isActive: !product.isActive })
    return { message: `Produit ${product.isActive ? 'désactivé' : 'activé'}` }
  }

  // ─── Price Calculator ─────────────────────────────────────
  async calculatePrice(dto: CalculatePriceDto) {
    const product = await this.findById(dto.productId)

    // Find finish modifier
    const finish      = product.finishes.find((f) => f.id === dto.finishId)
    const finishPrice = finish?.priceModifier || 0
    const format      = product.formats.find((f) => f.id === dto.formatId)
    const paper       = product.papers.find((p) => p.id === dto.paperId)

    const { total, unitPrice } = this.computePrice(
      product.basePrice,
      product.minQuantity,
      dto.quantity,
      finishPrice,
      dto.rectoverso,
      format?.multiplier || 1,
      paper?.priceExtra || 0,
    )

    // Find delivery days
    const deliveryDays = product.deliveryDays

    return {
      productId:    dto.productId,
      quantity:     dto.quantity,
      total,
      unitPrice,
      deliveryDays,
      currency:     'FCFA',
    }
  }

  // ─── Price calculation logic ──────────────────────────────
  computePrice(
    basePrice: number,
    minQuantity: number,
    quantity: number,
    finishModifier = 0,
    rectoverso = false,
    formatMultiplier = 1,
    paperExtra = 0,
  ): { total: number; unitPrice: number } {
    // Degressive pricing formula — must match computePrice in src/lib/data.ts (storefront)
    const multiplier = quantity / minQuantity
    let total = basePrice * Math.pow(multiplier, 0.75) * formatMultiplier

    // Recto/verso +60%
    if (rectoverso) total *= 1.6

    // Add finish and paper costs
    total += finishModifier + paperExtra

    // Round to nearest 100 FCFA
    total = Math.round(total / 100) * 100
    const unitPrice = Math.round((total / quantity) * 10) / 10

    return { total, unitPrice }
  }
}
