import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * Route publique qui reconnaît l'utilisateur s'il envoie un token valide :
 * req.user = utilisateur connecté, ou null (pas de token, token invalide/expiré).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err, user) {
    return user || null
  }
}
