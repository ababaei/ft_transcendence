import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModuleOptions, PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { Strategy } from "passport-42";
import { FortyTwoUser } from "../interfaces/42user.interface";
import { AUTH_MODULE_OPTIONS } from "../auth.constants";
import { AuthService } from "../auth.service";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env["42_CLIENT_ID"],
            clientSecret: process.env["42_CLIENT_SECRET"],
            callbackURL: process.env["42_CALLBACK_URL"]
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
        console.log("PROFILE: ", profile.id )
        
        const user = await this.authService.validateUser(profile);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}