import { User, UserState } from "./models";

import { UserEntity } from "./entity";
import { toolkit } from "serverless-stateful-linebot-framework";

const tk = toolkit<User, UserState, UserEntity>();

export default tk;
