import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { UserRole } from '../../modules/users/user.entity'

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.STAFF)) {
      throw new ForbiddenException('Accès réservé aux administrateurs')
    }
    return true
  }
}
