import { IsBase64, IsNotEmptyObject, IsOptional, IsString, ValidateNested } from "class-validator";

export class CloudRunPubSubWorkerPubSubMessage {
  @IsOptional()
  public readonly attributes?: Record<string, any> | null;

  @IsBase64()
  public readonly data?: string | Uint8Array | Buffer | null;

  @IsString()
  public readonly messageId!: string;
}

export class PubSubReceivedMessageDto {
  @ValidateNested({ message: "Invalid Pub/Sub message format" })
  @IsNotEmptyObject()
  public readonly message!: CloudRunPubSubWorkerPubSubMessage;
}
