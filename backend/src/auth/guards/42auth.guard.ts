import { HttpException, HttpStatus, Injectable, Redirect } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class SchoolAuthGuard extends AuthGuard('42') {
    constructor() {
        super();
      }
    
      handleRequest(err: any, user: any, info: any, context: any, status: any) {
        console.log('errorGuard', err);
        if (err || !user) {
          const res = context.switchToHttp().getResponse();
          return res.redirect(process.env.REDIRECT);
          // throw new HttpException('Non autoriser', HttpStatus.UNAUTHORIZED);
        }
        return user;
      }
}