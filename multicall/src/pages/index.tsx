import React, { useState, useEffect } from "react";
import SocketIOClient, { Socket } from "socket.io-client";
import Head from "next/head";
import Call from "src/components/call";

export default function Home() {
  const [connected, setConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    // connect to socket server
    const socketClient = SocketIOClient(process.env.BASE_URL, {
      path: "/api/socketio",
    });

    // make sure the socket is usable in other components
    setSocket(socketClient);
    setConnected(true);

    // disconnect on unmount
    if (socketClient) {
      return () => {
        socketClient.disconnect();
        setConnected(false);
      };
    }
  }, [setConnected, setSocket]);

  return (
    <div>
      <Head>
        <title>Multicall</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!(connected && socket) && (
        <div className="init-msg">
          <p>Connecting to the signaling server…</p>
        </div>
      )}
      {connected && socket && <Call socket={socket} />}
    </div>
  );
}
