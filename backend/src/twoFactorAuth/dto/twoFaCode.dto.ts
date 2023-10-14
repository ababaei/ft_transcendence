import { IsNotEmpty, IsString } from 'class-validator';

export class TwoFaCodeDto {
  @IsNotEmpty()
  @IsString()
  twoFaCode: string;
}

export default TwoFaCodeDto;
