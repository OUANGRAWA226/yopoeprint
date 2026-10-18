import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, tap } from 'rxjs'
import { AUDIT_KEY, AuditMeta } from './audit.decorator'
import { AuditService } from './audit.service'

/** Global : n'agit que sur les routes marquées @Audit(), après une réponse réussie. */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector, private audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<AuditMeta>(AUDIT_KEY, context.getHandler())
    if (!meta) return next.handle()

    const req = context.switchToHttp().getRequest()
    return next.handle().pipe(
      tap((result: any) => {
        void this.audit.record({
          actor: req.user,
          action: meta.action,
          targetType: meta.targetType,
          targetId: req.params?.id ?? result?.id ?? null,
          details: req.body && Object.keys(req.body).length ? req.body : null,
          ip: req.ip,
        })
      }),
    )
  }
}
