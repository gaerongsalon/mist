import {
  HistoryCommand,
  HistoryModifyCommand,
  HistoryModifySelectedCommand,
} from "../commands/history";

import { History } from "../models";
import { UserEntity } from "../entity";
import says from "../says";
import tk from "../toolkit";

type Context = ReturnType<typeof tk.typeOfContext>;

const addHistory = async (
  t: UserEntity,
  categoryNameOrAlias: string,
  comment: string,
  amount: number
) => {
  const category = t.category.findByNameOrAlias(categoryNameOrAlias);
  if (!category) {
    return t.category.elements.length === 0
      ? says.categoryHelp()
      : t.category.elements.map(says.categoryListItem).join("\n");
  }
  t.history.add({
    categoryIndex: category.index,
    budgetIndex: t.value.currentBudgetIndex,
    amount,
    comment,
    currency: t.userCurrency,
    registered: new Date().toISOString(),
  });
  return says.yes();
};

const startModifyHistory = async (context: Context, count: number) => {
  const { t } = context;
  const recent = t.history.findRecent({ count });
  if (recent.length === 0) {
    return says.noHistory();
  }
  recent.reverse();

  const { userCurrency } = t;
  const data = recent.map((e, index) => ({
    index: e.index,
    text: says.historyListItem({
      index: index + 1,
      categoryName: t.category.findNameByIndex(e.categoryIndex),
      comment: e.comment,
      amount: e.amount,
      currency: userCurrency,
    }),
  }));
  context.transit("modify", { data });
  return [
    says.modifyHelp(),
    says.guideSeparator(),
    ...data.map((e) => e.text),
  ].join("\n");
};

const selectModifyHistoryIndex = async (context: Context, selected: number) => {
  if (selected === undefined) {
    return says.pleaseNumber();
  }

  const payload = context.ensureState("modify");
  if (!payload) {
    console.error(`Invalid state`, context.state);
    context.transit(`empty`, undefined);
    return says.retryModify();
  }

  const targetIndex = selected - 1;
  if (targetIndex < 0 && targetIndex >= payload.data.length) {
    return says.pleaseNumber();
  }
  context.transit("modifySelected", {
    data: payload.data,
    selectedIndex: targetIndex,
  });
  return [
    says.modifySelectedHelp(),
    says.guideSeparator(),
    payload.data[targetIndex].text,
  ].join("\n");
};

const modifySelectedHistory = async (
  context: Context,
  callback: (historyIndex: number) => string
) => {
  const payload = context.ensureState("modifySelected");
  if (!payload) {
    console.error(`Invalid state`, context.state);
    context.transit(`empty`, undefined);
    return says.retryModify();
  }

  if (payload.selectedIndex === undefined) {
    return says.pleaseNumber();
  }
  const target = payload.data[payload.selectedIndex];
  context.transit(`empty`, undefined);
  if (!target) {
    return says.retryModify();
  }
  return callback(target.index);
};

const deleteSelectedHistory = async (context: Context) =>
  modifySelectedHistory(context, (index) => {
    context.t.history.remove(index);
    return says.deleted();
  });

const updateHistory = async (
  context: Context,
  maybeOmittedCategoryNameOrAlias: string,
  maybeOmittedComment: string,
  maybeOmittedAmount: string
) =>
  modifySelectedHistory(context, (index) => {
    const { t } = context;
    const omitted = "-";
    const updated: Partial<History> = {};
    if (maybeOmittedCategoryNameOrAlias !== omitted) {
      const category = t.category.findByNameOrAlias(
        maybeOmittedCategoryNameOrAlias
      );
      if (!category) {
        return t.category.elements.length === 0
          ? says.categoryHelp()
          : t.category.elements.map(says.categoryListItem).join("\n");
      }
      updated.categoryIndex = category.index;
    }
    if (maybeOmittedAmount !== omitted) {
      updated.amount = +maybeOmittedAmount;
    }
    if (maybeOmittedComment !== omitted) {
      updated.comment = maybeOmittedComment;
    }
    t.history.update(index, updated);
    return says.yes();
  });

const cancelHisotryModification = async (context: Context) => {
  context.transit("empty", undefined);
  return says.modificationCompleted();
};

export default tk.partialStateHandlers({
  empty: tk.handlers<HistoryCommand>({
    addHistory: ({ context: { t }, categoryNameOrAlias, comment, amount }) =>
      addHistory(t, categoryNameOrAlias, comment, amount),
    startModify: ({ context, count }) => startModifyHistory(context, count),
  }),
  modify: tk.handlers<HistoryModifyCommand>({
    startModify: ({ context, count }) => startModifyHistory(context, count),
    help: () => says.modifyHelp(),
    cancel: ({ context }) => cancelHisotryModification(context),
    choose: ({ context, index }) => selectModifyHistoryIndex(context, index),
  }),
  modifySelected: tk.handlers<HistoryModifySelectedCommand>({
    startModify: ({ context, count }) => startModifyHistory(context, count),
    help: () => says.modifySelectedHelp(),
    cancel: ({ context }) => cancelHisotryModification(context),
    choose: ({ context, index }) => selectModifyHistoryIndex(context, index),
    delete: ({ context }) => deleteSelectedHistory(context),
    update: ({
      context,
      maybeOmittedCategoryNameOrAlias,
      maybeOmittedComment,
      maybeOmittedAmount,
    }) =>
      updateHistory(
        context,
        maybeOmittedCategoryNameOrAlias,
        maybeOmittedComment,
        maybeOmittedAmount
      ),
  }),
});
