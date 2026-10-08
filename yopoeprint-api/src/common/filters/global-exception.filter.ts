import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request  = ctx.getRequest<Request>()

    let status  = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Erreur interne du serveur'
    let errors  = null

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const res = exception.getResponse() as any
      message = res.message || exception.message

      // Handle class-validator errors
      if (Array.isArray(res.message)) {
        message = 'Données invalides'
        errors  = res.message
      }
    } else {
      this.logger.error('Unexpected error:', exception)
    }

    response.status(status).json({
      success:   false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path:      request.url,
    })
  }
}
