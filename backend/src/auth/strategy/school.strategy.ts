import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";

@Injectable()
export class SchoolStrategy extends PassportStrategy(Strategy, 'SchoolStrategy') {
    constructor(config: ConfigService) {
        super({
            clientID: process.env["42_CLIENT_ID"],
            clientSecret: process.env["42_CLIENT_SECRET"],
            callbackURL: process.env["42_CALLBACK_URL"]
        });
    }
    // async validate(payload: {})
}