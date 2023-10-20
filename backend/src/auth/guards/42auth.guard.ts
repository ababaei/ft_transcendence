import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Injectable, Redirect } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";

@Catch(HttpException)
export class CustomHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    response.status(status).redirect(process.env.REDIRECT); // Remplacez '/page-d-erreur' par votre propre URL de page d'erreur
  }
}

@Injectable()
export class SchoolAuthGuard extends AuthGuard('42') {
    constructor() {
        super();
      }
    
      handleRequest(err: any, user: any, info: any, context: any, status: any) {
        console.log('errorGuard', err);
        if (err || !user) {
          const res = context.switchToHttp().getResponse();
          throw new HttpException('Non autorisé', HttpStatus.UNAUTHORIZED);
        }
        return user;
      }
}