import { getActor } from "./actor";
import * as line from "./utils/line";

export const webhook = line.installWebhook(async (id, command, replyToken) => {
  await getActor(id).send(
    {
      userId: id,
      command,
      replyToken
    },
    {
      // I think it would not be touched.
      shiftTimeout: 30 * 1000
    }
  );
});
