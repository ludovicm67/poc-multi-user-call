import React, { useState, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import { Socket } from "socket.io-client";
import Head from "next/head";
import Call from "src/components/call";
import SocketContext from "src/lib/SocketContext";

export default function Home() {
  const sm = useContext(SocketContext);
  const [socket, setSocket] = useState<Socket>();
  const stream = useSelector((state: any) => state.user.stream);

  useEffect(() => {
    const s = sm.getSocket();
    sm.connect();
    setSocket(s);
  }, [sm]);

  const isReady = socket && stream;

  return (
    <div>
      <Head>
        <title>Multicall</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!isReady && (
        <div className="init-msg">
          <p>Starting the call…</p>
        </div>
      )}
      {isReady && <Call />}
    </div>
  );
}
