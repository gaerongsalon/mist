import { UserRepository } from "../src/repository";
import routes from "../src/route";
import says from "../src/says";

const userId = "__tests__";
const repo = new UserRepository(userId);

const debugRoute = async (text: string) => {
  const eo = await repo.eo();
  const state = eo.state.get();
  const result = await routes[state.name].run(text, eo);
  console.log(result);
  await eo.store();
  return result;
};

beforeEach(async () => {
  await repo.delete();
});

test("says hello", async () => {
  const result = await debugRoute("안녕");
  expect(result).toBeDefined();
});

test("show recent", async () => {
  const result = await debugRoute("수정");
  expect(result).toBeDefined();
  await debugRoute("그만");
});

test("show goal", async () => {
  const result = await debugRoute("목표");
  expect(result).toBeDefined();
});

test("set and confirm currency", async () => {
  await debugRoute("기본 화폐 CHF");
  const result = await debugRoute("기본 화폐");
  expect(result).toEqual("현재 설정된 기본 화폐는 CHF입니다.");
});

test("set and confirm tz", async () => {
  await debugRoute("기본 시간 1");
  const result = await debugRoute("기본 시간");
  expect(result).toEqual("현재 설정된 시간대는 1입니다.");
});

test("set and confirm goal", async () => {
  await debugRoute("기본 화폐 CHF");
  await debugRoute("목표 1000.17");
  const result = await debugRoute("목표");
  expect(result).toEqual("목표는 1,000.17CHF입니다.");
});

test("show today", async () => {
  const result = await debugRoute("오늘");
  expect(result).toBeDefined();
});

test("add history and show today", async () => {
  await debugRoute("분류 1 음식 추가");
  await debugRoute("1 pizza 342.12");
  const today = await debugRoute("오늘");
  expect(today).toBeDefined();
});

test("summarize today", async () => {
  await debugRoute("분류 1 음식 추가");
  await debugRoute("1 pizza 342.12");
  const result = await debugRoute("누적 오늘");
  expect(result).toBeDefined();
});

test("add two", async () => {
  await debugRoute("분류 1 음식 추가");
  await debugRoute("1 pizza 342.12");
  await debugRoute("1 pizza 342.12");
  const result = await debugRoute("누적 오늘");
  expect(result).toBeDefined();
  expect(result).toContain("684.24");
});

test("delete all history", async () => {
  await debugRoute("분류 1 음식 추가");
  for (let i = 0; i < 10; ++i) {
    await debugRoute("1 pizza 12");
  }
  await debugRoute("누적 오늘");

  while (true) {
    const list = await debugRoute("수정");
    if (list === says.noHistory()) {
      await debugRoute("ㅂㅂ");
      break;
    }
    await debugRoute("1");
    await debugRoute("지워");
  }
}, 1000);

test("add two category", async () => {
  await debugRoute("분류 1 식사 추가");
  await debugRoute("분류 2 교통 추가");
  await debugRoute("1 pizza 34.2");
  await debugRoute("2 taxi 11");
  expect(await debugRoute("누적 오늘 식사")).toContain("34.2");
  expect(await debugRoute("누적 오늘 교통")).toContain("11");
});

test("modify history", async () => {
  await debugRoute("분류 1 식사 추가");
  await debugRoute("1 pizza 34.2");
  expect(await debugRoute("오늘 식사")).toContain("34.2");
  await debugRoute("수정");
  await debugRoute("1");
  await debugRoute("1 pasta 14.8");
  expect(await debugRoute("오늘 식사")).toContain("14.8");
});

test("reset state", async () => {
  await debugRoute("어디야");
  await debugRoute("돌아와");
});
