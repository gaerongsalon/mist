import { UserEO, UserStateName } from "../repository";

type Handler = (
  user: UserEO,
  ...args: string[]
) => string | string[] | Promise<string | string[]>;

interface IRoute {
  regex: RegExp;
  handler: Handler;
}

export type PartialRouteMap = {
  [V in UserStateName]?: Router;
};

export type RouteMap = {
  [V in UserStateName]: Router;
};

export class Router {
  private readonly routes: IRoute[] = [];

  public add(regex: RegExp, handler: Handler) {
    this.routes.push({ regex, handler });
    return this;
  }

  public addAll(other: Router) {
    Array.prototype.push.apply(this.routes, other.routes);
    return this;
  }

  public async run(text: string, user: UserEO) {
    for (const { regex, handler } of this.routes) {
      if (regex.test(text)) {
        const matches = text.match(regex);
        const result = handler(user, ...matches!.slice(1, matches!.length));
        if (result instanceof Promise) {
          return await result;
        }
        return result;
      }
    }
    return null;
  }
}

export const mergeRoutes = (dest: RouteMap, ...sources: PartialRouteMap[]) => {
  for (const key of Object.keys(dest)) {
    const typedKey = key as UserStateName;
    for (const source of sources) {
      const sourceRouter: Router | undefined = source[typedKey];
      if (sourceRouter === undefined) {
        continue;
      }
      dest[typedKey].addAll(sourceRouter);
    }
  }
  return dest;
};
