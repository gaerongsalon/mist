import { BudgetCommand, BudgetDeleteCommand } from "../commands/budget";
import says from "../says";
import tk from "../toolkit";

export default tk.partialStateHandlers({
  empty: tk.handlers<BudgetCommand>({
    help: () => says.budgetHelp(),
    list: ({ context: { t } }) => {
      return [
        ...(t.budget.elements.length === 0
          ? [says.budgetHelp()]
          : t.budget.elements.map(says.budgetListItem)),
        says.guideSeparator(),
        t.budget.current
          ? says.currentBudget({
              name: t.budget.current.name,
              amount: t.budget.current.amount,
              remain: t.remain,
              currency: t.budget.current.currency
            })
          : says.noBudget()
      ].join("\n");
    },
    addOrUpdate: ({ context: { t }, name, amount, currency }) => {
      if (!name) {
        return says.budgetHelp();
      }
      const oldBudget = t.budget.findByName(name);
      if (oldBudget) {
        t.budget.update(oldBudget.index, { name, amount, currency });
        return says.budgetUpdated();
      } else {
        t.budget.add({ name, amount, currency });
        return says.yes();
      }
    },
    startToDelete: ({ context, name }) => {
      const { t } = context;
      const target = t.budget.find(each => each.name === name);
      if (!target) {
        return says.noBudget();
      }
      context.transit("deleteBudget", {
        selectedIndex: target.index
      });
      return says.confirmDeleteBudget(target);
    },
    use: ({ context, name }) => {
      const { t } = context;
      const target = t.budget.find(each => each.name === name);
      if (!target) {
        return says.noBudget();
      }
      context.update({
        ...t.value,
        currentBudgetIndex: target.index
      });
      return says.changeBudget(target);
    },
    unuse: ({ context }) => {
      const { t } = context;
      context.update({
        ...t.value,
        currentBudgetIndex: -1
      });
      return says.resetBudget();
    }
  }),
  deleteBudget: tk.handlers<BudgetDeleteCommand>({
    delete: ({ context }) => {
      const { t } = context;
      const payload = context.ensureState("deleteBudget");
      if (payload) {
        t.budget.remove(payload.selectedIndex);
        t.history.removeWhere(
          each => each.budgetIndex === payload.selectedIndex
        );
      }
      context.transit("empty", undefined);
      return says.deleted();
    },
    cancelDeletion: ({ context }) => {
      context.transit("empty", undefined);
      return says.modificationCompleted();
    }
  })
});
