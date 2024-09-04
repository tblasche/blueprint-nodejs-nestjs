import { IsNotEmpty } from 'class-validator';

export class CreateDemoDto {
  @IsNotEmpty()
  title: string;

  description?: string;
}
