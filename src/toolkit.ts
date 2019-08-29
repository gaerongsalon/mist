import { toolkit } from "serverless-stateful-linebot-framework";
import { UserEntity } from "./entity";
import { IUser, UserState } from "./models";

const tk = toolkit<IUser, UserState, UserEntity>();

export default tk;
