import { validateSync } from "class-validator";
import { CloudRunPubSubWorkerPubSubMessage, PubSubReceivedMessageDto } from "./message.dto";
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};
describe("PubSubReceivedMessageDto", () => {
  it("should be defined", () => {
    expect(new PubSubReceivedMessageDto());
  });

  it("should throw error", () => {
    const dto = new PubSubReceivedMessageDto();
    expect(validateSync(dto)).toEqual([
      {
        children: [],
        constraints: { isNotEmptyObject: "message must be a non-empty object" },
        property: "message",
        target: dto,
        value: undefined,
      },
    ]);
  });

  it("should validate", () => {
    const dto = Object.assign<PubSubReceivedMessageDto, DeepPartial<PubSubReceivedMessageDto>>(
      new PubSubReceivedMessageDto(),
      {
        message: Object.assign<CloudRunPubSubWorkerPubSubMessage, CloudRunPubSubWorkerPubSubMessage>(
          new CloudRunPubSubWorkerPubSubMessage(),
          {
            attributes: {
              test: "test",
            },
            data: "eyJ0ZXN0IjoidGVzdCJ9",
          },
        ),
      },
    );
    expect(validateSync(dto)).toEqual([]);
  });
});
