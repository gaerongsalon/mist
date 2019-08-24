import { UserRepository } from "../src/repository";

const userId = "__tests__";

test("load default", async () => {
  const repo = new UserRepository(userId);
  const user = await repo.get();
  expect(user).toBeDefined();
});

test("save goal", async () => {
  const repo = new UserRepository(userId);
  const user = await repo.get();
  user.goal = 1000;
  await repo.set(user);

  expect((await repo.get()).goal).toBe(1000);
});

test("save tz", async () => {
  const repo = new UserRepository(userId);
  const user = await repo.get();
  user.timezoneOffset = -1;
  await repo.set(user);

  expect((await repo.get()).timezoneOffset).toBe(-1);
});

test("save currency", async () => {
  const repo = new UserRepository(userId);
  const user = await repo.get();
  user.currency = "eur";
  await repo.set(user);

  expect((await repo.get()).currency).toEqual("eur");
});

test("save korea currency", async () => {
  const repo = new UserRepository(userId);
  const user = await repo.get();
  user.currency = "원";
  await repo.set(user);

  expect((await repo.get()).currency).toBe("원");
});

test("save state", async () => {
  const repo = new UserRepository(userId);
  const user = await repo.get();

  const expected = {
    name: "complex",
    data: ["a", "b", "c"]
  };
  user.state = JSON.stringify(expected);
  await repo.set(user);

  expect(JSON.parse((await repo.get()).state!)).toEqual(expected);
});
