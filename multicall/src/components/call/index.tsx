import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { constraints, offerOptions } from "src/call/default";
import { OtherUser, User } from "src/types/call";
import Others from "./others";
import Panel from "./panel";

const rtcConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

type CallProps = {
  socket: Socket;
};

const names = [
  "Alice",
  "Bob",
  "Charlie",
  "Dave",
  "Erin",
  "Franck",
  "Jon",
  "Jane",
];

const listenUser = (
  socket: Socket,
  users: Record<string, OtherUser>,
  data: Record<string, User>,
  setUsers: Dispatch<Record<string, OtherUser>>,
  stream: MediaStream
) => {
  if (!socket.id) {
    return;
  }

  const newUsers: Record<string, OtherUser> = {};
  const dataUsers = Object.values(data);
  const dataUsersId = dataUsers.map((u) => u.id);

  // remove old users from the list
  Object.values(users)
    .filter((u) => dataUsersId.includes(u.id))
    .forEach((u) => {
      newUsers[u.id] = u;
    });

  dataUsers.forEach(async (u) => {
    if (u.id === socket.id) {
      return;
    }

    if (!newUsers.hasOwnProperty(u.id)) {
      newUsers[u.id] = u;
    }

    if (!newUsers[u.id].hasOwnProperty("pc")) {
      const pc = new RTCPeerConnection(rtcConfiguration);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.addEventListener("icecandidate", (e) => {
        socket.emit("message", {
          type: "icecandidate",
          from: socket.id,
          to: u.id,
          data: e.candidate,
        });
      });

      pc.addEventListener("track", (e) => {
        const peerStream = e.streams[0];
        if (
          !newUsers[u.id].hasOwnProperty("stream") ||
          newUsers[u.id].stream !== peerStream
        ) {
          newUsers[u.id].stream = peerStream;
        }
      });

      newUsers[u.id].pc = pc;

      if (socket.id < u.id) {
        const offer = await newUsers[u.id].pc.createOffer(offerOptions);
        await newUsers[u.id].pc.setLocalDescription(offer);

        socket.emit("message", {
          type: "offer",
          from: socket.id,
          to: u.id,
          data: offer,
        });
      }
    }
  });

  setUsers(newUsers);
};

const socketEmit = (socket: Socket, type: string, content: any) => {
  if (!socket) {
    console.error("no socket available");
    return;
  }

  socket.emit(type, content);
};

export default function Call({ socket }: CallProps) {
  const randomName = names[Math.floor(Math.random() * names.length)];

  const [stream, setStream] = useState<MediaStream>();
  const [displayName, setDisplayName] = useState<string>(randomName);
  const [sentInit, setSentInit] = useState<boolean>(false);
  const roomName = "default";

  const [users, setUsers] = useState<Record<string, OtherUser>>({});

  // initialize local video stream
  useEffect(() => {
    (async () => {
      const myStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(myStream);

      if (!sentInit) {
        setSentInit(true);
        socketEmit(socket, "user", {
          username: displayName,
          room: roomName,
        });
      }
    })();
  }, [setStream, sentInit, displayName, roomName, socket]);

  useEffect(() => {
    if (!socket) {
      console.error("no socket available");
      return;
    }

    socket.on("user", (data) =>
      listenUser(socket, users, data, setUsers, stream)
    );

    return () => {
      socket.off("user");
    };
  }, [socket, users, setUsers, stream]);

  return (
    <div className="multicall-app">
      <Others users={users} />
      <Panel stream={stream} users={users} />
    </div>
  );
}
