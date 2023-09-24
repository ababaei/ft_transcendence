import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy} from "passport-42";
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

    async validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<any> {
        console.log("PROFILE: ", profile.id )
        const user = await this.authService.validateUser(profile);
        if (!user) {
            throw new UnauthorizedException();
        }
        done(null, user);
    }
}