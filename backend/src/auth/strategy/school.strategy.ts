import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModuleOptions, PassportStrategy } from "@nestjs/passport";
import { User } from "@prisma/client";
import { Strategy, Profile } from "passport-42";
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

    async validate(accessToken: string, refreshToken: string, profile: string): Promise<any> {
        console.log({ profile })
        return profile;
    }
}