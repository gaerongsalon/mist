import { CategoryCommand } from "../../commands/category";
import tk from "../../toolkit";

export default tk.partialStateRoutes({
  empty: tk.routes<CategoryCommand>({
    help: {
      regex: /^(?:카테고리|분류)\s*(?:도움)(?:말)?[!?]?$/,
      parse: () => undefined
    },
    list: {
      regex: /^(?:카테고리|분류)[!]*$/,
      parse: () => undefined
    },
    addCategory: {
      regex: /^(?:카테고리|분류)\s+(\d+)\s+(.+)(?:추가)[!]*$/,
      parse: ([alias, maybeName]) => ({
        alias,
        name: maybeName.trim()
      })
    }
  })
});
