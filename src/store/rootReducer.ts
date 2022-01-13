import { combineReducers } from "redux";
import messagesReducer from "./messagesSlice";
import userReducer from "./userSlice";
import usersReducer from "./usersSlice";

const rootReducer = combineReducers({
  messages: messagesReducer,
  user: userReducer,
  users: usersReducer,
});

export default rootReducer;
