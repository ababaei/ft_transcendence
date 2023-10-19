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
          Redirect('http://localhost:8080/login', 302);
          throw new HttpException('Non autoriser', HttpStatus.UNAUTHORIZED);
        }
        return user;
      }
}