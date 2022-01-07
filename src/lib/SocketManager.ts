import SocketIOClient, { Socket } from "socket.io-client";

import { constraints, offerOptions } from "src/call/default";
import rtcConfiguration from "src/call/rtcConfiguration";
import { OtherUser, User } from "src/types/call";

type MessageData = {
  type: string;
  to: string;
  from: string;
  data: any;
};

const SocketManager = class SocketManager {
  store: any;
  socket: Socket;

  constructor(store: any) {
    this.store = store;
    this.socket = SocketIOClient(process.env.BASE_URL, {
      path: "/api/socketio",
    });

    this.socket.on("connect", () => {
      this.store.dispatch({
        type: 'USER_UPDATE_ID',
        payload: this.socket.id,
      });
    })
  }

  /**
   * Start connection.
   */
  async connect() {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.store.dispatch({
      type: 'USER_UPDATE_STREAM',
      payload: stream,
    });

    const localUser = this.store.getState().user;
    this.socketEmit("user", {
      displayName: localUser.displayName,
      room: localUser.room,
    });

    this.socket.on("user", (data: Record<string, User>) => this.listenUser(data));
    this.socket.on("message", (data: MessageData) => this.listenMessage(data));
  }

  /**
   * Get the Socket object.
   * @returns the Socket object.
   */
  public getSocket(): Socket {
    return this.socket;
  }

  /**
   * Emit a message on the socket.
   *
   * @param type Type of message to be sent.
   * @param content Content of the message to be sent.
   *
   * @returns nothing.
   */
  socketEmit(type: string, content: any) {
    if (!this.socket) {
      console.error("no socket available");
      return;
    }

    this.socket.emit(type, content);
  };

  /**
   * Do something with data coming from a data channel.
   *
   * @param id The id of the user that sent the data.
   * @param data Data received.
   */
  getDataChannel(id: string, data: any) {
    console.log(`[data channel] got following data from '${id}': ${JSON.stringify(data)}`);
  }

  /**
   * Broadcast on all data channels.
   *
   * @param data Data to broadcast.
   */
  broadcastDataChannel(data: any) {
    const state = this.store.getState();
    const users: Record<string, OtherUser> = state.users;

    Object.values(users).forEach((u) => {
      if (u.dc.readyState === 'open') {
        u.dc.send(data);
      }
    });
  }

  /**
   * Listen on "user" events.
   *
   * @param data List of users.
   */
  listenUser(data: Record<string, User>) {
    if (!this.socket || !this.socket.id) {
      return;
    }

    const state = this.store.getState();
    const stream: any = state.user.stream;
    const users: Record<string, OtherUser> = state.users;

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
      // ignore current user from the list
      if (u.id === this.socket.id) {
        return;
      }

      if (!newUsers.hasOwnProperty(u.id)) {
        newUsers[u.id] = u;
      }

      if (!newUsers[u.id].hasOwnProperty("pc")) {
        const pc = new RTCPeerConnection(rtcConfiguration);
        stream.getTracks().forEach((track: MediaStreamTrack) => pc.addTrack(track, stream));

        pc.addEventListener("icecandidate", (e) => {
          this.socketEmit("message", {
            type: "icecandidate",
            from: this.socket.id,
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
            this.store.dispatch({
              type: 'USERS_SET_STREAM',
              payload: {
                id: u.id,
                stream: peerStream,
              },
            });
          }
        });

        pc.addEventListener("datachannel", (e) => {
          this.store.dispatch({
            type: 'USERS_SET_DATA_CHANNEL',
            payload: {
              id: u.id,
              dc: e.channel,
            },
          });
          e.channel.onmessage = (e) => {
            this.getDataChannel(u.id, e.data);
          };
        });

        if (this.socket.id < u.id) {
          const dc = pc.createDataChannel("data");
          dc.onmessage = (e) => {
            this.getDataChannel(u.id, e.data);
          };
          newUsers[u.id].dc = dc;
        }

        newUsers[u.id].pc = pc;

        if (this.socket.id < u.id) {
          const offer = await newUsers[u.id].pc.createOffer(offerOptions);
          await newUsers[u.id].pc.setLocalDescription(offer);

          this.socketEmit("message", {
            type: "offer",
            from: this.socket.id,
            to: u.id,
            data: offer,
          });
        }
      }
    });

    this.store.dispatch({
      type: 'USERS_SET',
      payload: newUsers,
    });
  }

  /**
   * Listen on "message" events.
   *
   * @param data Message.
   */
  async listenMessage(data: MessageData) {
    if (!this.socket || !this.socket.id) {
      return;
    }

    const state = this.store.getState();
    const users: Record<string, OtherUser> = state.users;

    // mal-formed messages
    if (!data.type || !data.to || !data.from || data.to !== this.socket.id) {
      return;
    }

    // got a message from someone that is not in the users list ; ignore it
    if (!users.hasOwnProperty(data.from)) {
      return;
    }

    if (data.type === "offer") {
      if (!users[data.from].hasOwnProperty("pc")) {
        console.error(`no peer connection with ${data.from}`);
        return;
      }

      users[data.from].pc.setRemoteDescription(data.data);
      const answer = await users[data.from].pc.createAnswer();
      await users[data.from].pc.setLocalDescription(answer);
      this.socketEmit("message", {
        type: "answer",
        from: this.socket.id,
        to: data.from,
        data: answer,
      });
    }

    if (data.type === "answer") {
      if (!users[data.from].hasOwnProperty("pc")) {
        console.error(`no peer connection with ${data.from}`);
        return;
      }
      users[data.from].pc.setRemoteDescription(data.data);
    }

    if (data.type === "icecandidate") {
      if (!users[data.from].hasOwnProperty("pc")) {
        console.error(`no peer connection with ${data.from}`);
        return;
      }
      users[data.from].pc.addIceCandidate(data.data);
    }
  }
};

export default SocketManager;
