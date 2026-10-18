import { Controller, Get, Post as HttpPost, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { Post } from './post.entity'
import { PostsService } from './posts.service'
import { CreatePostDto, UpdatePostDto } from './post.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ManagerGuard } from '../../common/guards/admin.guard'
import { Audit } from '../audit/audit.decorator'

@ApiTags('Blog')
@Controller()
export class PostsController {
  constructor(private posts: PostsService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Articles publiés (contenu rendu en HTML échappé)' })
  listPublished() {
    return this.posts.listPublished()
  }

  @Get('posts/slug/:slug')
  @ApiOperation({ summary: 'Article publié par son adresse' })
  findPublished(@Param('slug') slug: string) {
    return this.posts.findPublished(slug)
  }

  @Get('admin/posts')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Tous les articles, brouillons compris (Markdown brut)' })
  listAll() {
    return this.posts.listAll()
  }

  @HttpPost('admin/posts')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Audit('post.create', 'post')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Créer un article' })
  create(@Body() dto: CreatePostDto) {
    return this.posts.create(dto)
  }

  @Patch('admin/posts/:id')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Audit('post.update', 'post')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Modifier, publier ou dépublier un article' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePostDto) {
    return this.posts.update(id, dto)
  }

  @Delete('admin/posts/:id')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  @Audit('post.delete', 'post')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Supprimer un article' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.posts.remove(id)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
