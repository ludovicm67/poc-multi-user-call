import { useStore } from "react-redux";

import SocketManager from "src/lib/SocketManager";
import SocketContext from "src/lib/SocketContext";
import TransferFileContext from "src/lib/TransferFileContext";
import { wrapper } from "src/store";

import "../styles/globals.css";
import { TransferFilePool } from "@ludovicm67/lib-filetransfer";

function MyApp({ Component, pageProps }) {
  const store = useStore();

  const filePool = new TransferFilePool({});
  const sm = new SocketManager(store, filePool);

  return (
    <TransferFileContext.Provider value={filePool}>
      <SocketContext.Provider value={sm}>
        <Component {...pageProps} />
      </SocketContext.Provider>
    </TransferFileContext.Provider>
  );
}

export default wrapper.withRedux(MyApp);
