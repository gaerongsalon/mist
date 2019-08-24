import * as line from "@line/bot-sdk";
import { ConsoleLogger } from "@yingyeothon/logger";
import * as awsTypes from "aws-lambda";
import { alignTextLines } from "./text";

const logger = new ConsoleLogger("info");

const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.CHANNEL_SECRET!
};
const lineClient = new line.Client(lineConfig);

type CommandHandler = (
  id: string,
  command: string,
  replyToken: string
) => Promise<void>;

export const installWebhook = (handler: CommandHandler) => async (
  gatewayEvent: awsTypes.APIGatewayEvent
) => {
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
      logger.debug(`EventFromLine`, JSON.stringify(lineEvents, null, 2));
    } catch (err) {
      throw new line.JSONParseError(err.message, body);
    }

    for (const lineEvent of lineEvents.events) {
      const sourceId =
        (lineEvent.source as line.Room).roomId ||
        (lineEvent.source as line.Group).groupId ||
        lineEvent.source.userId!;
      if (lineEvent.type === "message" && lineEvent.message.type === "text") {
        await handler(
          sourceId,
          (lineEvent.message.text || "").trim(),
          lineEvent.replyToken
        );
      }
    }
    return { statusCode: 200, body: "OK" };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: error.message || "FAIL" };
  }
};

export const reply = (replyToken: string, response: string) => {
  const texts = alignTextLines(response.split("\n"));
  return lineClient.replyMessage(
    replyToken,
    texts.map(text => ({
      type: "text",
      text
    }))
  );
};
