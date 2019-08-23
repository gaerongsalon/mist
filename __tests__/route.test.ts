import route from "../src/route";
import says from "../src/says";

const userId = "__tests__";

const debugRoute = (text: string) =>
  route(userId, text).then(result => {
    console.log(result);
    return result;
  });

beforeEach(async () => {
  while (true) {
    const list = await debugRoute("수정");
    if (list === says.noHistory()) {
      await debugRoute("ㅂㅂ");
      break;
    }
    await debugRoute("1");
    await debugRoute("ㅇㅇ");
  }
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
