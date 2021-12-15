import React, { useState, useEffect, useRef } from "react";
import SocketIOClient, { Socket } from "socket.io-client";
import Head from "next/head";

export default function Home() {
  const [connected, setConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket>();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // connect to socket server
    const socketClient = SocketIOClient(process.env.BASE_URL, {
      path: "/api/socketio",
    });

    // make sure the socket is usable in other components
    setSocket(socketClient);

    // log socket connection
    socketClient.on("connect", () => {
      console.log("SOCKET CONNECTED!", socketClient.id);
      setConnected(true);
      socketClient.emit("message", {
        data: "hello",
      });
    });

    // update chat on new message dispatched
    socketClient.on("message", (message) => {
      console.log("got message", message);
    });

    // disconnect on unmount
    if (socketClient) {
      return () => {
        socket.disconnect();
        setConnected(false);
      };
    }
  });

  const socketEmit = (type: string, ...args: any[]) => {
    if (!connected) {
      console.error("not connected to socket");
    }

    socket.emit(type, ...args);
  };

  const sendHello = () => {
    socketEmit("message", {
      data: "hello from button",
    });
  };

  return (
    <div>
      <Head>
        <title>Multicall</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <p>Welcome to Multicall!</p>
        <p>
          <button onClick={sendHello}>Send hello</button>
        </p>
      </div>
    </div>
  );
}
