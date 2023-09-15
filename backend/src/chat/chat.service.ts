import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
    buttonTestReq(): string {
        return 'Requette Recue';
    }
}
