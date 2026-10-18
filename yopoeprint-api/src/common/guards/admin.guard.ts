import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { UserRole, isBackOffice, isManager } from '../../modules/users/user.entity'

/** Back-office : superadmin, admin et staff (atelier). À placer après JwtAuthGuard. */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user
    if (!isBackOffice(user?.role)) throw new ForbiddenException('Accès réservé aux administrateurs')
    return true
  }
}

/** Gestion : superadmin et admin (catalogue, clients, revendeurs). Le staff atelier n'y a pas accès. */
@Injectable()
export class ManagerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user
    if (!isManager(user?.role)) throw new ForbiddenException('Action réservée aux administrateurs')
    return true
  }
}

/** Superadmin uniquement : équipe, paramètres de la plateforme, journal des actions. */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user
    if (user?.role !== UserRole.SUPERADMIN) throw new ForbiddenException('Action réservée au super administrateur')
    return true
  }
}
