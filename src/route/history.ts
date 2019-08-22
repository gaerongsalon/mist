import { UserStateName } from "../repository";
import { UserEO } from "../repository/eo/user";
import says from "../says";
import * as util from "../utils/text";
import { PartialRouteMap, Router } from "./router";

const startModifyHistory = async (eo: UserEO, count: number) => {
  const recent = eo.history.findRecent({ count });
  if (recent.length === 0) {
    return says.noHistory;
  }
  recent.reverse();
  const data = recent.map((e, index) => {
    return {
      index: e.index,
      text: `[${index}] (${eo.category.findNameByIndex(e.categoryIndex)}) ${
        e.comment
      } ${util.withComma(e.amount)}${eo.userCurrency}`
    };
  });
  eo.state.set({ name: UserStateName.modify, data });
  await eo.store();
  return util.alignTextLines(data.map(e => e.text));
};

const selectModifyHistoryIndex = async (eo: UserEO, selected: number) => {
  if (selected === undefined) {
    return says.pleaseNumber;
  }

  const userState = eo.state.get();
  if (userState.name !== UserStateName.modify) {
    console.error(`Invalid state`, userState);
    eo.state.reset();
    return says.retryModify;
  }

  const targetIndex = selected - 1;
  if (targetIndex < 0 && targetIndex >= userState.data.length) {
    return says.pleaseNumber;
  }
  eo.state.set({
    name: UserStateName.modifySelected,
    data: userState.data,
    selectedIndex: targetIndex
  });
  return userState.data[targetIndex].text;
};

const deleteSelectedHistory = async (eo: UserEO) => {
  const userState = eo.state.get();
  if (userState.name !== UserStateName.modifySelected) {
    console.error(`Invalid state`, userState);
    eo.state.reset();
    return says.retryModify;
  }

  if (userState.selectedIndex === undefined) {
    return says.pleaseNumber;
  }
  const target = userState.data[userState.selectedIndex];
  eo.state.reset();
  if (target) {
    eo.history.remove(target.index);
  }
  return target ? says.deleted : says.retryModify;
};

const cancelHisotryModification = async (eo: UserEO) => {
  eo.state.reset();
  return says.modificationCompleted;
};

const routes: PartialRouteMap = {
  [UserStateName.empty]: new Router()
    .add(
      /^([\d\w]+)\s*(.+)\s+(\d+(?:\.\d+)?)(?:\w+)?[!]*$/,
      (eo, maybeCategoryNameOrAlias, maybeComment, maybeAmount) => {
        const comment = (maybeComment || "").trim();
        const amount = +(maybeAmount || "");
        const category = eo.category.findByNameOrAlias(
          maybeCategoryNameOrAlias
        );
        if (!category) {
          return eo.category.elements.length === 0
            ? says.categoryHelp
            : util.alignTextLines(
                eo.category.elements.map(e => `[${e.alias}] ${e.name}`)
              );
        }
        eo.history.add({
          categoryIndex: category.index,
          budgetIndex: eo.value.currentBudgetIndex,
          amount,
          comment,
          currency: eo.userCurrency,
          registered: new Date().toISOString()
        });
        return says.yes;
      }
    )
    .add(/^수정\s*(\d+)?(?:개)?[!]*$/, (eo, maybeCount) =>
      startModifyHistory(eo, +maybeCount)
    ),
  [UserStateName.modify]: new Router()
    .add(/^수정\s*(\d+)?(?:개)?[!]*$/, (eo, maybeCount) =>
      startModifyHistory(eo, +maybeCount)
    )
    .add(/^(\d+)(?:번)?[!]*$/, (eo, maybeIndex) =>
      selectModifyHistoryIndex(eo, +maybeIndex)
    )
    .add(/^(?:ㅂㅂ|그만|취소)[!]*$/, cancelHisotryModification)
    .add(/^(?:\?|\?\?|\?.\?|도움|도와줘)[!]*$/, () => says.modifyHelp),
  [UserStateName.modifySelected]: new Router()
    .add(/^수정\s*(\d+)?(?:개)?[!]*$/, (eo, maybeCount) =>
      startModifyHistory(eo, +maybeCount)
    )
    .add(/^(\d+)(?:번)?[!]*$/, (eo, maybeIndex) =>
      selectModifyHistoryIndex(eo, +maybeIndex)
    )
    .add(/^(?:ㅂㅂ|그만|취소)[!]*$/, cancelHisotryModification)
    .add(/^(?:ㅇㅇ|지워|삭제)[!]*$/, deleteSelectedHistory)
    .add(/^(?:\?|\?\?|\?.\?|도움|도와줘)[!]*$/, () => says.modifySelectedHelp)
};

export default routes;
