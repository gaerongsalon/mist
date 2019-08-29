import { options } from "../src/handler";
import says from "../src/says";
import tk from "../src/toolkit";

const userId = "__tests__";
const processor = tk.newProcessorBuilder(options)(userId);

const debugRoute = async (text: string) => {
  // console.log(text);
  await processor.prepareContext();
  const response = await processor.processCommand(text);
  // console.log(response);
  await processor.storeContext();
  return response;
};

beforeEach(async () => {
  await processor.truncate();
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
  await debugRoute("기본 화폐 EUR");
  await debugRoute("목표 50");
  await debugRoute("분류 1 식사 추가");
  await debugRoute("분류 2 교통 추가");
  await debugRoute("1 pizza 34.2");
  await debugRoute("2 taxi 11");
  expect(await debugRoute("누적 오늘 식사")).toContain("34.2");
  expect(await debugRoute("누적 오늘 교통")).toContain("11");

  const wholeThings = await debugRoute("전체");
  expect(wholeThings).toContain("34.2");
  expect(wholeThings).toContain("11");
  expect(await debugRoute("전체 식사")).toContain("34.2");
  expect(await debugRoute("전체 교통")).toContain("11");
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

test("modify budget", async () => {
  await debugRoute("예산 책정 100 원 가난뱅이");
  const before = await debugRoute("예산 목록");
  expect(before).toContain("가난뱅이");
  expect(before).toContain("100");

  await debugRoute("예산 책정 50 원 가난뱅이");
  const after = await debugRoute("예산 목록");
  expect(after).toContain("가난뱅이");
  expect(after).toContain("50");
});

test("modify history with omitted values", async () => {
  await debugRoute("분류 1 식사 추가");
  await debugRoute("분류 2 간식 추가");
  await debugRoute("1 pizza 34.2");

  const original = await debugRoute("오늘");
  expect(original).toContain("식사");
  expect(original).toContain("pizza");
  expect(original).toContain("34.2");

  // Modfiy a category.
  await debugRoute("수정");
  await debugRoute("1");
  await debugRoute("2 - -");

  const categoryModified = await debugRoute("오늘");
  expect(categoryModified).toContain("간식");
  expect(categoryModified).toContain("pizza");
  expect(categoryModified).toContain("34.2");

  // Modify a comment.
  await debugRoute("수정");
  await debugRoute("1");
  await debugRoute("- pan -");

  const commentModified = await debugRoute("오늘");
  expect(commentModified).toContain("간식");
  expect(commentModified).toContain("pan");
  expect(commentModified).toContain("34.2");

  // Modify a amount.
  await debugRoute("수정");
  await debugRoute("1");
  await debugRoute("- - 5.4");

  const amountModified = await debugRoute("오늘");
  expect(amountModified).toContain("간식");
  expect(amountModified).toContain("pan");
  expect(amountModified).toContain("5.4");
});
