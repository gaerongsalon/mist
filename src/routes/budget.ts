import { BudgetCommand, BudgetDeleteCommand } from "../commands/budget";
import tk from "../toolkit";

export default tk.partialStateRoutes({
  empty: tk.routes<BudgetCommand>({
    help: {
      regex: /^(?:예산)\s*(?:도움)(?:말)?[!?]*/,
      parse: () => undefined
    },
    list: {
      regex: /^(?:예산\s*(?:목록)?)[!]*$/,
      parse: () => undefined
    },
    addOrUpdate: {
      regex: /^(?:예산)\s*(?:책정|추가|등록)\s*(\d+(?:\.\d+)?)\s+([^ ]+)\s+(.+)[!]*$/,
      parse: ([maybeAmount, maybeCurrency, maybeName]) => ({
        amount: +(maybeAmount || "0"),
        currency: maybeCurrency.trim(),
        name: maybeName.trim()
      })
    },
    startToDelete: {
      regex: /^(?:예산)\s*(?:삭제)\s*(.+)[!]*$/,
      parse: ([maybeName]) => ({ name: maybeName.trim() })
    },
    use: {
      regex: /^(?:예산)\s*(?:설정|사용|변경)?\s*(.+)[!]*$/,
      parse: ([maybeName]) => ({ name: maybeName.trim() })
    },
    unuse: {
      regex: /^(?:예산)\s*(?:취소)[!]*$/,
      parse: () => undefined
    }
  }),
  deleteBudget: tk.routes<BudgetDeleteCommand>({
    delete: {
      regex: /^(?:ㅇㅇ|지워|삭제)[!]*$/,
      parse: () => undefined
    },
    cancelDeletion: {
      regex: /^(?:ㅂㅂ|ㄴㄴ|아니|취소)[!]*$/,
      parse: () => undefined
    }
  })
});
