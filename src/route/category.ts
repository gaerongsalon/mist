import { UserStateName } from "../repository";
import says from "../says";
import { alignTextLines } from "../utils/text";
import { PartialRouteMap, Router } from "./router";

const routes: PartialRouteMap = {
  [UserStateName.empty]: new Router()
    // category
    .add(/^(?:카테고리|분류)[!]*$/, eo =>
      eo.category.elements.length === 0
        ? says.categoryHelp
        : alignTextLines(
            eo.category.elements.map(e => `[${e.alias}] ${e.name}`)
          )
    )
    .add(
      /^(?:카테고리|분류)\s+(\d+)\s+(.+)(?:추가)[!]*$/,
      (eo, maybeAlias, maybeName) => {
        const alias = (maybeAlias || "").trim();
        const name = (maybeName || "").trim();
        if (!alias || !name) {
          return says.categoryHelp;
        }
        eo.category.add({ name, alias });
        return says.yes;
      }
    )
};

export default routes;
