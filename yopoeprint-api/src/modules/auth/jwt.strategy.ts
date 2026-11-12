import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/user.entity'
import { SessionsService } from '../sessions/sessions.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private sessions: SessionsService,
  ) {
    super({
      jwtFromRequest:   ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:      configService.get('jwt.secret'),
    })
  }

  async validate(payload: any) {
    // A refresh token must never be usable as an access token (even if both secrets are equal)
    if (payload?.typ === 'refresh') {
      throw new UnauthorizedException('Token invalide')
    }
    // Jeton lié à une session : refusé dès qu'elle est fermée (déconnexion, mot de passe changé, compte désactivé)
    if (!payload?.sid || !(await this.sessions.isOpen(payload.sid, payload.sub))) {
      throw new UnauthorizedException('Session expirée. Veuillez vous reconnecter.')
    }
    const user = await this.userRepo.findOne({ where: { id: payload.sub } })
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Compte introuvable ou désactivé')
    }
    return {
      id:    user.id,
      email: user.email,
      role:  user.role,
      sid:   payload.sid as string,
    }
  }
}
