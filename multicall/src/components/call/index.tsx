import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { constraints } from "src/call/default";
import Others from "./others";
import Panel from "./panel";

type CallProps = {
  socket: Socket;
};

export default function Call({ socket }: CallProps) {
  const [stream, setStream] = useState<MediaStream>();

  // initialize local video stream
  useEffect(() => {
    (async () => {
      const myStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(myStream);
    })();
  }, [setStream]);

  return (
    <div className="multicall-app">
      <Others />
      <Panel stream={stream} />
    </div>
  );
}
