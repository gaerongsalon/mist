import {
  HistoryCommand,
  HistoryModifyCommand,
  HistoryModifySelectedCommand
} from "../../commands/history";
import tk from "../../toolkit";

const startModify = {
  regex: /^수정\s*(\d+)?(?:개)?[!]*$/,
  parse: ([maybeCount]: string[]) => ({ count: +(maybeCount || "10") })
};

const choose = {
  regex: /^(\d+)(?:번)?[!]*$/,
  parse: ([maybeIndex]: string[]) => ({ index: +maybeIndex })
};

const cancel = {
  regex: /^(?:ㅂㅂ|그만|취소)[!]*$/,
  parse: () => undefined
};

const help = {
  regex: /^(?:\?|\?\?|\?.\?|도움|도와줘)[!]*$/,
  parse: () => undefined
};

export default tk.partialStateRoutes({
  empty: tk.routes<HistoryCommand>({
    addHistory: {
      regex: /^([\d\w]+)\s*(.+)\s+(\d+(?:\.\d+)?)(?:\w+)?[!]*$/,
      parse: ([maybeCategory, maybeComment, maybeAmount]) => ({
        categoryNameOrAlias: maybeCategory,
        comment: maybeComment.trim(),
        amount: +maybeAmount
      })
    },
    startModify
  }),
  modify: tk.routes<HistoryModifyCommand>({
    startModify,
    cancel,
    choose,
    help
  }),
  modifySelected: tk.routes<HistoryModifySelectedCommand>({
    startModify,
    choose,
    cancel,
    help,
    update: {
      regex: /^([\d\w]+|-)\s*(.+)\s+(\d+(?:\.\d+)?|-)(?:\w+)?[!]*$/,
      parse: ([
        maybeOmittedCategoryNameOrAlias,
        maybeOmittedComment,
        maybeOmittedAmount
      ]) => ({
        maybeOmittedCategoryNameOrAlias: maybeOmittedCategoryNameOrAlias.trim(),
        maybeOmittedComment: maybeOmittedComment.trim(),
        maybeOmittedAmount: maybeOmittedAmount.trim()
      })
    },
    delete: {
      regex: /^(?:지워|삭제)[!]*$/,
      parse: () => undefined
    }
  })
});
