import React, { useState, useEffect, useRef } from "react";
import SocketIOClient, { Socket } from "socket.io-client";
import Head from "next/head";
import { User } from "src/types/call";
import { constraints } from "src/call/default";

const userIdFromUsername = (username: string) => {
  return parseInt(username.replace(/^user-/, ""));
};

export default function Home() {
  const [connected, setConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket>();
  const [me, setMe] = useState<User>({
    username: `user-${Date.now()}`,
    room: "default",
  });
  const [stream, setStream] = useState<MediaStream>();

  const socketEmit = (type: string, ...args: any[]) => {
    if (!connected) {
      console.error("not connected to socket");
    }

    socket.emit(type, ...args);
  };

  useEffect(() => {
    // connect to socket server
    const socketClient = SocketIOClient(process.env.BASE_URL, {
      path: "/api/socketio",
    });

    // make sure the socket is usable in other components
    setSocket(socketClient);

    // disconnect on unmount
    if (socketClient) {
      return () => {
        socketClient.disconnect();
        setConnected(false);
      };
    }
  }, [setConnected, setSocket]);

  useEffect(() => {
    async () => {
      const myStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(myStream);
    };
  }, [setStream]);

  useEffect(() => {
    if (!(connected && stream && socket)) {
      return;
    }
  }, [connected, stream, socket]);

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
