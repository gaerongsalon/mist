import { withComma } from "../utils/text";
import { MessagesMap } from "./messages";

const messages: MessagesMap = {
  yes: () => `네!`,
  hello: () => `안녕하세요!`,
  warning: () => `삐뽀!삐뽀!`,
  superWarning: () => `가난뱅이 빔!!!`,
  pleaseNumber: () => `번호를 다시 입력해주세요..!`,
  noHistory: () => `최근 결제 내역이 없습니다!`,
  retryModify: () => `처음부터 다시 수정해주세요 ㅜㅜ`,
  deleted: () => `지웠습니다!`,
  modificationCompleted: () => `수정을 완료합니다 :)`,
  modifyHelp: () =>
    `[숫자]를 입력하여 선택한 내역을 수정/삭제하거나, [그만]을 하여 수정을 그만 둘 수 있어요.`,
  modifySelectedHelp: () =>
    `[숫자]를 다시 입력하여 선택한 내역을 바꾸거나,\n` +
    `[(분류) (내역) (금액)]을 써서 해당 항목을 변경하거나,\n` +
    `[지워]를 써서 선택된 내역을 지우거나,\n` +
    `[그만]을 하여 수정을 그만 둘 수 있어요.`,
  help: () =>
    `[분류]를 확인하고, [목표 (원)]으로 목표를 설정합니다.\n` +
    `[(분류) (내역) (금액)]을 써서 내역을 입력한 후, [수정] 할 수 있습니다.\n` +
    `[오늘], [이번 주], [이번 달]의 내역을 조회할 수 있어요.\n` +
    `[예산 책정]을 통해 예산을 관리할 수 있고 자세한 내용은 [예산 도움]으로 확인해주세요!`,
  goalHelp: () => `[목표 20000원]과 같이 목표를 설정해보세요!`,
  categoryHelp: () => `[분류 (번호) (이름) 추가]로 분류를 추가해보세요!`,
  sumOfCategory: () => `[누적 (기간) (분류 이름)]으로 계산해보세요!`,
  budgetHelp: () =>
    `[예산 책정 (금액) (화폐) (이름)]으로 입력해주세요. 예를 들어, "예산 책정 1000 CHF 스위스 여행"처럼 입력해주시면 됩니다!\n` +
    `그리고 [예산 설정 (예산 이름)]으로 사용할 예산을 변경하거나, [예산 취소]를 통해 예산 모드를 중단할 수 있습니다.\n` +
    `마지막으로 [예산 삭제 (예산 이름)]으로 등록한 예산을 삭제할 수 있습니다. 이렇게 되면 그 예산의 구매 이력은 조회가 불가능하니 조심하세요!`,
  noBudget: () => `예산을 설정해주세요!`,
  currentBudget: ({ name, amount, remain, currency }) =>
    `현재 예산은 [${name}] ${withComma(
      amount
    )}${currency}이고, 남은 금액은 ${withComma(remain)}${currency} (${(
      (remain * 100) /
      amount
    ).toFixed(1)}%)입니다.`,
  budgetListItem: ({ name, amount, currency }) =>
    `[${name}] ${withComma(amount)}${currency}`,
  confirmDeleteBudget: ({ name }) =>
    `예산 [${name}]을 정말 삭제할까요? 해당 예산 내의 모든 이력이 삭제됩니다.`,
  resetBudget: () => `예산 모드를 초기화합니다.`,
  changeBudget: ({ name }) => `예산을 [${name}]으로 변경합니다.`,
  categoryListItem: ({ name, alias }) => `[${alias}] ${name}`,
  historyListItem: ({ index, categoryName, comment, amount, currency }) =>
    `[${index}] (${categoryName}) ${comment} ${withComma(amount)}${currency}`,
  reportHistoryItem: ({ categoryName, comment, amount, currency }) =>
    `[${categoryName}] ${comment} ${withComma(amount)}${currency}`,
  reportHistoryEnd: ({ totalUsed, totalGoal, currency }) =>
    totalGoal > 0
      ? `총 ${withComma(totalUsed)}${currency} 사용했고, ${withComma(
          totalGoal - totalUsed
        )}${currency} (${(((totalGoal - totalUsed) / totalGoal) * 100).toFixed(
          1
        )}%) 남았습니다.`
      : `총 ${withComma(totalUsed)}${currency} 사용했습니다.`,
  reportSummaryItem: ({ categoryName, amount, currency }) =>
    `[${categoryName}] ${withComma(amount)}${currency}`,
  reportSummaryEnd: ({ totalUsed, currency }) =>
    `총 ${withComma(totalUsed)}${currency} 사용했습니다.`,
  getsetGoal: ({ goal, currency }) =>
    `목표는 ${withComma(goal)}${currency}입니다.`,
  getsetTimezone: ({ timezoneOffset }) =>
    `현재 설정된 시간대는 ${timezoneOffset}입니다.`,
  getsetCurrency: ({ currency }) =>
    `현재 설정된 기본 화폐는 ${currency}입니다.`,
  guideSeparator: () => `---`,
  whereAmI: ({ where }) => `저는 [${where}]에 있어요!`,
  budgetUpdated: () => `예산이 갱신되었습니다!`
};

export default messages;
