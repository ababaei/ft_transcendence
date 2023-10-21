import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class photoUrlDto {
  @IsNotEmpty()
  @IsUrl()
  avatar: string;
}

export default photoUrlDto;
