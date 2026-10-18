import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { UserRole } from '../../modules/users/user.entity'

/** Réservé aux revendeurs validés (à placer après JwtAuthGuard). */
@Injectable()
export class ResellerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user
    if (user?.role !== UserRole.RESELLER) {
      throw new ForbiddenException('Espace réservé aux revendeurs validés')
    }
    return true
  }
}
