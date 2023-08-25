import { UserEntity } from "./entity";
import { emptyUser } from "./models";
import handlers from "./handlers";
import { installWebhook } from "serverless-stateful-linebot-framework";
import routes from "./routes";
import tk from "./toolkit";

export const options = tk.options({
  bucketPrefix: "mist/",
  routeHandlers: tk.routeHandlers(routes, handlers),
  initialEntity: emptyUser,
  initialState: () => ({ name: "empty", payload: undefined }),
  decorateEntity: (user) => new UserEntity(user),
});
const getActor = tk.newReplierGenerator(options);

export const webhook = installWebhook(async (id, command, replyToken) => {
  await getActor(id)(
    { command, replyToken },
    // I think it would not be touched.
    30 * 1000
  );
});
