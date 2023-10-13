import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as speakeasy from 'speakeasy';

@Injectable()
export class UsersService {
  generateSecretKey(): string {
    const buffer = speakeasy.generateSecret({ length: 20 });
    const secretKey = buffer.base32;
    return secretKey;
  }

  saveSecretKey(userID: string, key: string) {
    
  }
}