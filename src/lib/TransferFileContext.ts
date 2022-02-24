import { TransferFilePool } from "@ludovicm67/lib-filetransfer";
import { createContext } from "react";

const TransferFileContext = createContext<TransferFilePool>(undefined);

export default TransferFileContext;
