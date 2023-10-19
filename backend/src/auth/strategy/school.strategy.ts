import { Injectable, Redirect, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService } from '../auth.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env['42_CLIENT_ID'],
      clientSecret: process.env['42_CLIENT_SECRET'],
      callbackURL: process.env['42_CALLBACK_URL'],
      profileFields: {
        id: function (obj) {
          return String(obj.id);
        },
        username: 'login',
        displayName: 'displayname',
        'name.familyName': 'last_name',
        'name.givenName': 'first_name',
        profileUrl: 'url',
        'emails.0.value': 'email',
        'phoneNumbers.0.value': 'phone',
        'photos.0.value': 'image_url',
      },
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    // console.log(profile);
    if (!profile)
    {
      // console.log('ici')
      Redirect(process.env.FAIL)
    }
    // console.log('PROFILE: ', profile);
    const validUser = await this.authService.validateUser(profile);
    // console.log('TOKEN: ', validUser.user.id);
    if (!validUser) {
      throw new UnauthorizedException();
    }
    return done(null, validUser);
  }
}
