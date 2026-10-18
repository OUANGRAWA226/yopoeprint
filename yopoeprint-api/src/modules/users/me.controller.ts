import { Controller, Patch, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { UsersService } from './users.service'
import { UpdateProfileDto, ChangePasswordDto } from './user.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Mon compte')
@Controller('users/me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeController {
  constructor(private usersService: UsersService) {}

  @Patch()
  @ApiOperation({ summary: 'Modifier mon profil (nom, email, téléphone, adresses)' })
  updateProfile(@CurrentUser() user, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto)
  }

  @Patch('password')
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } }) // anti brute-force du mot de passe actuel
  @ApiOperation({ summary: 'Changer mon mot de passe' })
  changePassword(@CurrentUser() user, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto)
  }
}
