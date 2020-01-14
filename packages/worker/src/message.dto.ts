import {
  IsBase64,
  IsDateString,
  IsNotEmptyObject,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
export class PubSubMessageDto {
  @IsOptional()
  public readonly attributes?: Record<string, any>;

  @IsBase64()
  public readonly data!: string;

  @IsNumberString()
  public readonly messageId!: string;

  @IsDateString()
  @IsOptional()
  public readonly publishTime!: string;
}

export class PubSubRootDto {
  @ValidateNested({ message: "Invalid Pub/Sub message format" })
  @IsNotEmptyObject()
  public readonly message!: PubSubMessageDto;

  @IsString()
  public readonly subscription!: string;
}
