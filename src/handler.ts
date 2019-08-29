import { installWebhook } from "serverless-stateful-linebot-framework";
import { UserEntity } from "./entity";
import handlers from "./handlers";
import { emptyUser } from "./models";
import routes from "./routes";
import tk from "./toolkit";

export const options = tk.options({
  bucketPrefix: "mist/",
  routeHandlers: tk.routeHandlers(routes, handlers),
  initialEntity: emptyUser,
  initialState: () => ({ name: "empty", payload: undefined }),
  decorateEntity: user => new UserEntity(user)
});
const getActor = tk.newActorGetter(options);

export const webhook = installWebhook(async (id, command, replyToken) => {
  await getActor(id).send(
    {
      command,
      replyToken
    },
    {
      // I think it would not be touched.
      shiftTimeout: 30 * 1000
    }
  );
});
