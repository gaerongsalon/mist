import { CategoryCommand } from "../commands/category";
import says from "../says";
import tk from "../toolkit";

export default tk.partialStateHandlers({
  empty: tk.handlers<CategoryCommand>({
    help: () => says.categoryHelp(),
    list: ({ context: { t } }) =>
      t.category.elements.length === 0
        ? says.categoryHelp()
        : t.category.elements.map(says.categoryListItem).join("\n"),
    addCategory: ({ context: { t }, alias, name }) => {
      if (!alias || !name) {
        return says.categoryHelp();
      }
      if (!!t.category.find((each) => each.name === name)) {
        return says.categoryDuplicated();
      }
      t.category.add({ name, alias });
      return says.yes();
    },
  }),
});
