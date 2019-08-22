import { IUser } from "..";

export enum UserStateName {
  empty = "empty",
  modify = "modify",
  modifySelected = "modifySelected",
  deleteBudget = "deleteBudget"
}

interface IUserEmptyState {
  name: UserStateName.empty;
}

interface IUserModifyState {
  name: UserStateName.modify;
  data: Array<{
    index: number;
    text: string;
  }>;
}

interface IUserModifySelectedState {
  name: UserStateName.modifySelected;
  selectedIndex: number;
  data: IUserModifyState["data"];
}

interface IUserDeleteBudgetState {
  name: UserStateName.deleteBudget;
  selectedIndex: number;
}

export type UserState =
  | IUserEmptyState
  | IUserModifyState
  | IUserModifySelectedState
  | IUserDeleteBudgetState;
const stateNames = Object.keys(UserStateName).map(e => e);

export class UserStateEO {
  constructor(private readonly user: IUser) {}

  public get(): UserState {
    if (!this.user.state) {
      return { name: UserStateName.empty };
    }
    const maybe = JSON.parse(this.user.state) as UserState;
    if (!maybe.name || !stateNames.includes(maybe.name)) {
      console.warn(`Invalid userState[${this.user.state}]`);
      return { name: UserStateName.empty };
    }
    return maybe;
  }

  public set(newState: UserState) {
    this.user.state =
      newState.name !== UserStateName.empty
        ? JSON.stringify(newState)
        : undefined;
  }

  public reset() {
    this.set({ name: UserStateName.empty });
  }
}
