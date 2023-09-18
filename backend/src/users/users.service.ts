import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
    private readonly users: User[] = [
        {id: 1, name: "toto", password: "pass123"},
        {id: 2, name: "zozo", password: "pass456"},
        {id: 3, name: "titi", password: "pass789"},        
    ]

    async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.name === username)
    }
}
