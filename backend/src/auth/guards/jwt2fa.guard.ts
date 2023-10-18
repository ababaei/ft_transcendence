import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import jwt_decode from "jwt-decode";

@Injectable()
export class Jwt2faGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // console.log('request: ', request);
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    const decodedTkn: object = jwt_decode(token)
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_KEY,
      });
      const user: User = await this.prismaService.user.findUnique({
        where: { id: payload['id'] },
      });
      
      console.log('PAYLOAD: ', decodedTkn['twoFaAuthenticated']);
      if (user.twoFaActivated && !decodedTkn['twoFaAuthenticated'])
        throw new UnauthorizedException();
      request['user'] = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ');
    // console.log('type :', type);
    // console.log('token :', token);
    return type === 'Bearer' ? token : undefined;
  }
}
