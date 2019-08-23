import * as line from "@line/bot-sdk";
import * as awsTypes from "aws-lambda";
import route from "./route";
import { alignTextLines } from "./utils/text";

const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.CHANNEL_SECRET!
};

export const webhook = async (gatewayEvent: awsTypes.APIGatewayEvent) => {
  console.log(gatewayEvent);

  try {
    const signature = gatewayEvent.headers["X-Line-Signature"] as string;
    if (!signature) {
      throw new line.SignatureValidationFailed("no signature");
    }

    const body = gatewayEvent.body!;
    if (!line.validateSignature(body, lineConfig.channelSecret, signature)) {
      throw new line.SignatureValidationFailed(
        "signature validation failed",
        signature
      );
    }

    let lineEvents: { events: line.WebhookEvent[] };
    try {
      lineEvents = JSON.parse(body);
      console.log(JSON.stringify(lineEvents, null, 2));
    } catch (err) {
      throw new line.JSONParseError(err.message, body);
    }

    const lineClient = new line.Client(lineConfig);
    for (const lineEvent of lineEvents.events) {
      const sourceId =
        (lineEvent.source as line.Room).roomId ||
        (lineEvent.source as line.Group).groupId ||
        lineEvent.source.userId!;
      if (lineEvent.type === "message" && lineEvent.message.type === "text") {
        await handleEvent(
          sourceId,
          (lineEvent.message.text || "").trim(),
          texts =>
            lineClient.replyMessage(
              lineEvent.replyToken,
              texts.map(text => ({
                type: "text",
                text
              }))
            )
        );
      }
    }
    return { statusCode: 200, body: "OK" };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: error.message || "FAIL" };
  }
};

const handleEvent = async (
  id: string,
  requestText: string,
  reply: (texts: string[]) => Promise<any>
) => {
  try {
    const responseText = await route(id, requestText);
    if (responseText === null) {
      return;
    }
    await reply(alignTextLines(responseText.split(/\n/)));
  } catch (error) {
    console.error(`LogicError`, error);
  }
};
