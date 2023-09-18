import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { Strategy, Profile } from "passport-42";
import { FortyTwoUser } from "../interfaces/42user.interface";
import { AuthService } from "../auth.service";

@Injectable()
export class SchoolStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            clientID: process.env["42_CLIENT_ID"],
            clientSecret: process.env["42_CLIENT_SECRET"],
            callbackURL: process.env["42_CALLBACK_URL"]
        });
    }

    async validate(username: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(username, password)
        if (!user) throw new UnauthorizedException()
        return user;
    }
    // async validate
}