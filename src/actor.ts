import {
  ActorSystem,
  InMemoryLock,
  InMemoryQueue
} from "@yingyeothon/actor-system";
import { RedisLock, RedisQueue } from "@yingyeothon/actor-system-redis-support";
import { ConsoleLogger } from "@yingyeothon/logger";
import IORedis from "ioredis";
import mem from "mem";
import { UserEO, UserRepository } from "./repository";
import routes from "./route";
import * as line from "./utils/line";

const logger = new ConsoleLogger("debug");
const getRedis = mem(() => {
  if (process.env.NODE_ENV === "test") {
    throw new Error();
  }
  return new IORedis({
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
  });
});

const getSystem = mem(() =>
  process.env.NODE_ENV === "test"
    ? new ActorSystem({
        queue: new InMemoryQueue(),
        lock: new InMemoryLock(),
        logger
      })
    : new ActorSystem({
        queue: new RedisQueue({ redis: getRedis(), logger }),
        lock: new RedisLock({ redis: getRedis(), logger }),
        logger
      })
);

export const getActor = (id: string) => {
  const handler = new Handler(id);
  return getSystem().spawn<IRequest>(id, actor =>
    actor
      .on("beforeAct", handler.onBeforeAct)
      .on("afterAct", handler.onAfterAct)
      .on("act", handler.onAct)
      .on("error", error => logger.error(`ActorError`, id, error))
  );
};

export interface IRequest {
  userId: string;
  command: string;
  replyToken: string;
}

class Handler {
  private readonly repository: UserRepository;
  private eo: UserEO | undefined;

  constructor(userId: string) {
    this.repository = new UserRepository(userId);
  }

  public onBeforeAct = async () => {
    this.eo = await this.repository.eo();
  };

  public onAfterAct = async () => {
    if (this.eo) {
      await this.eo.store();
    }
  };

  public onAct = async ({
    message: { userId, command, replyToken }
  }: {
    message: IRequest;
  }) => {
    if (!this.eo) {
      return;
    }

    const userState = this.eo.state.get();
    logger.debug(
      `Handle text[${command}] on user[${JSON.stringify(this.eo.value)}]`
    );
    const response = await routes[userState.name].run(command, this.eo);
    logger.debug(
      `result of cmd[${command}] in user[${userId}]'s state[${JSON.stringify(
        userState
      )}] is result[${JSON.stringify(response)}]`
    );

    if (response) {
      line.reply(replyToken, response);
    }
  };
}
