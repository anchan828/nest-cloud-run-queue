import { decodeMessage } from "./util";

describe("decodeMessage", () => {
  const sameDecodedMessage = { data: { text: "message" }, name: "test" };

  it("should parse pubsub message", () => {
    expect(
      decodeMessage({
        attributes: {},
        data: "eyJkYXRhIjp7InRleHQiOiJtZXNzYWdlIn0sIm5hbWUiOiJ0ZXN0In0=",
        headers: {
          accept: "text/html, image/gif, image/jpeg, *; q=.2, */*; q=.2",
          connection: "keep-alive",
          "content-length": "181",
          "content-type": "application/json",
          host: "demo:3000",
          "user-agent": "Java/1.8.0_265",
        },
        messageId: "4",
      }),
    ).toEqual({
      data: sameDecodedMessage,
      headers: {
        accept: "text/html, image/gif, image/jpeg, *; q=.2, */*; q=.2",
        connection: "keep-alive",
        "content-length": "181",
        "content-type": "application/json",
        host: "demo:3000",
        "user-agent": "Java/1.8.0_265",
      },
      id: "4",
      raw: {
        attributes: {},
        data: "eyJkYXRhIjp7InRleHQiOiJtZXNzYWdlIn0sIm5hbWUiOiJ0ZXN0In0=",
        headers: {
          accept: "text/html, image/gif, image/jpeg, *; q=.2, */*; q=.2",
          connection: "keep-alive",
          "content-length": "181",
          "content-type": "application/json",
          host: "demo:3000",
          "user-agent": "Java/1.8.0_265",
        },
        messageId: "4",
      },
    });
  });

  it("should parse task message", () => {
    expect(
      decodeMessage({
        data: { text: "message" },
        headers: {
          "accept-encoding": "gzip",
          "content-length": "54",
          "content-type": "application/json",
          host: "demo:3000",
          "user-agent": "Google-Cloud-Tasks",
          "x-cloudtasks-queuename": "nest-cloud-run-queue-demo",
          "x-cloudtasks-tasketa": "1721236265.266817",
          "x-cloudtasks-taskexecutioncount": "11",
          "x-cloudtasks-taskname": "16520968670258952483",
          "x-cloudtasks-taskretrycount": "11",
        },
        name: "test",
      }),
    ).toEqual({
      data: sameDecodedMessage,
      headers: {
        "accept-encoding": "gzip",
        "content-length": "54",
        "content-type": "application/json",
        host: "demo:3000",
        "user-agent": "Google-Cloud-Tasks",
        "x-cloudtasks-queuename": "nest-cloud-run-queue-demo",
        "x-cloudtasks-tasketa": "1721236265.266817",
        "x-cloudtasks-taskexecutioncount": "11",
        "x-cloudtasks-taskname": "16520968670258952483",
        "x-cloudtasks-taskretrycount": "11",
      },
      id: expect.any(String),
      raw: {
        data: { text: "message" },
        headers: {
          "accept-encoding": "gzip",
          "content-length": "54",
          "content-type": "application/json",
          host: "demo:3000",
          "user-agent": "Google-Cloud-Tasks",
          "x-cloudtasks-queuename": "nest-cloud-run-queue-demo",
          "x-cloudtasks-tasketa": "1721236265.266817",
          "x-cloudtasks-taskexecutioncount": "11",
          "x-cloudtasks-taskname": "16520968670258952483",
          "x-cloudtasks-taskretrycount": "11",
        },
        name: "test",
      },
    });
  });

  it("should parse raw message", () => {
    expect(
      decodeMessage({
        data: { text: "message" },
        name: "test",
      }),
    ).toEqual({
      data: sameDecodedMessage,
      id: expect.any(String),
      raw: {
        data: { text: "message" },
        name: "test",
      },
    });
  });
});
