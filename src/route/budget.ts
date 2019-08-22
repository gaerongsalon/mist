import { UserStateName } from "../repository";
import says from "../says";
import { alignTextLines, withComma } from "../utils/text";
import { PartialRouteMap, Router } from "./router";

const routes: PartialRouteMap = {
  [UserStateName.empty]: new Router()
    .add(/^(?:예산\s*도움말)[!?]?/, () => says.budgetHelp)
    .add(/^(?:예산)$/, eo =>
      !eo.budget.current
        ? says.noBudget
        : `현재 예산은 [${eo.budget.current.name}] ${eo.budget.current.amount}${eo.budget.current.currency}이고, 남은 금액은 ${eo.remain}${eo.budget.current.currency}입니다.`
    )
    .add(/^(?:예산\s*목록)$/, eo =>
      eo.budget.elements.length === 0
        ? says.budgetHelp
        : alignTextLines(
            eo.budget.elements.map(
              e => `[${e.name}] ${withComma(e.amount)}${e.currency}`
            )
          )
    )
    .add(
      /^(?:예산)\s*(?:설정|책정)\s*(\d+(?:\.\d+)?)\s+(\w+)\s+(.+)$/,
      (eo, amount, currency, maybeName) => {
        const name = (maybeName || "").trim();
        if (!name) {
          return says.budgetHelp;
        }
        eo.budget.add({ name: name.trim(), amount: +amount, currency });
        return says.yes;
      }
    )
    .add(/^(?:예산)\s*(?:삭제)\s*(.+)$/, (eo, maybeName) => {
      const name = (maybeName || "").trim();
      const target = eo.budget.find(each => each.name === name);
      if (!target) {
        return says.noBudget;
      }
      eo.state.set({ name: UserStateName.deleteBudget, selectedIndex: target.index });
      return `예산 [${target.name}]을 정말 삭제할까요? 해당 예산 내의 모든 이력이 삭제됩니다.`;
    })
    .add(/^(?:예산)\s*(?:취소)$/, eo => {
      eo.value.currentBudgetIndex = -1;
      return `예산 모드를 초기화합니다.`;
    })
    .add(/^(?:예산)\s*(?:설정)?\s*(.+)$/, (eo, maybeName) => {
      const name = (maybeName || "").trim();
      const target = eo.budget.find(each => each.name === name);
      if (!target) {
        return says.noBudget;
      }
      eo.value.currentBudgetIndex = target.index;
      return `예산을 [${target.name}]으로 변경합니다.`;
    }),
  [UserStateName.deleteBudget]: new Router()
    .add(/^(?:ㅇㅇ|지워|삭제)[!]*$/, eo => {
      const state = eo.state.get();
      if (state.name === UserStateName.deleteBudget) {
        eo.budget.remove(state.selectedIndex);
      }
      eo.state.reset();
      return says.deleted;
    })
    .add(/^(?:ㅂㅂ|ㄴㄴ|아니|취소)[!]*$/, eo => {
      eo.state.reset();
      return says.modificationCompleted;
    })
};

export default routes;
