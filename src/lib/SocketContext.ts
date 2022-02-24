import { createContext } from "react";
import { SocketManagerType } from "./SocketManager";

const SocketContext = createContext<SocketManagerType>(undefined);

export default SocketContext;
