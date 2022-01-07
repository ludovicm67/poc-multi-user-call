import { createContext } from "react";
import { useStore } from "react-redux";

import SocketManager from "src/lib/SocketManager";
import SocketContext from "src/lib/SocketContext";
import { wrapper } from "src/store";

import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  const store = useStore();

  const sm = new SocketManager(store);

  return (
    <SocketContext.Provider value={sm}>
      <Component {...pageProps} />
    </SocketContext.Provider>
  );
}

export default wrapper.withRedux(MyApp);
