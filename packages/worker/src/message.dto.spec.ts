import { validateSync } from "class-validator";
import { PubSubMessageDto, PubSubRootDto } from "./message.dto";
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};
describe("PubSubRootDto", () => {
  it("should be defined", () => {
    expect(new PubSubRootDto());
  });

  it("should throw error", () => {
    const dto = new PubSubRootDto();
    expect(validateSync(dto)).toEqual([
      {
        children: [],
        constraints: { isNotEmptyObject: "message must be a non-empty object" },
        property: "message",
        target: dto,
        value: undefined,
      },
      {
        children: [],
        constraints: { isString: "subscription must be a string" },
        property: "subscription",
        target: dto,
        value: undefined,
      },
    ]);
  });

  it("should throw error", () => {
    const dto = Object.assign<PubSubRootDto, DeepPartial<PubSubRootDto>>(new PubSubRootDto(), {
      subscription: "subscription",
    });
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

  it("should throw error", () => {
    const dto = Object.assign<PubSubRootDto, DeepPartial<PubSubRootDto>>(new PubSubRootDto(), {
      message: Object.assign<PubSubMessageDto, DeepPartial<PubSubMessageDto>>(new PubSubMessageDto(), {
        messageId: "message",
      }),
      subscription: "subscription",
    });
    expect(validateSync(dto)).toEqual([
      {
        children: [
          {
            children: [],
            constraints: {
              isBase64: "data must be base64 encoded",
            },
            property: "data",
            target: {
              messageId: "message",
            },
          },
          {
            children: [],
            constraints: {
              isNumberString: "messageId must be a number string",
            },
            property: "messageId",
            target: {
              messageId: "message",
            },
            value: "message",
          },
        ],
        property: "message",
        target: {
          message: {
            messageId: "message",
          },
          subscription: "subscription",
        },
        value: {
          messageId: "message",
        },
      },
    ]);
  });

  it("should throw error", () => {
    const dto = Object.assign<PubSubRootDto, DeepPartial<PubSubRootDto>>(new PubSubRootDto(), {
      message: Object.assign<PubSubMessageDto, PubSubMessageDto>(new PubSubMessageDto(), {
        attributes: {
          test: "test",
        },
        data: "data",
        messageId: "message",
        publishTime: "1234",
      }),
      subscription: "subscription",
    });
    expect(validateSync(dto)).toEqual([
      {
        children: [
          {
            children: [],
            constraints: {
              isNumberString: "messageId must be a number string",
            },
            property: "messageId",
            target: {
              attributes: {
                test: "test",
              },
              data: "data",
              messageId: "message",
              publishTime: "1234",
            },
            value: "message",
          },
          {
            children: [],
            constraints: {
              isDateString: "publishTime must be a ISOString",
            },
            property: "publishTime",
            target: {
              attributes: {
                test: "test",
              },
              data: "data",
              messageId: "message",
              publishTime: "1234",
            },
            value: "1234",
          },
        ],
        property: "message",
        target: {
          message: {
            attributes: {
              test: "test",
            },
            data: "data",
            messageId: "message",
            publishTime: "1234",
          },
          subscription: "subscription",
        },
        value: {
          attributes: {
            test: "test",
          },
          data: "data",
          messageId: "message",
          publishTime: "1234",
        },
      },
    ]);
  });

  it("should validate", () => {
    const dto = Object.assign<PubSubRootDto, DeepPartial<PubSubRootDto>>(new PubSubRootDto(), {
      message: Object.assign<PubSubMessageDto, PubSubMessageDto>(new PubSubMessageDto(), {
        attributes: {
          test: "test",
        },
        data: "eyJ0ZXN0IjoidGVzdCJ9",
        messageId: "934074354430499",
        publishTime: "2020-01-14T05:19:35.957Z",
      }),
      subscription: "subscription",
    });
    expect(validateSync(dto)).toEqual([]);
  });
});
