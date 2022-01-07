import { combineReducers } from "redux";
import userReducer from "./userSlice";
import usersReducer from "./usersSlice";

const rootReducer = combineReducers({
  user: userReducer,
  users: usersReducer,
});

export default rootReducer;
