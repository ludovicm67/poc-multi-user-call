const socket = io();

// some webrtc config
const constraints = {
  audio: true,
  video: true,
};

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};

const params = (new URL(document.location)).searchParams;
const roomName = params.get("room") || "default";

const me = {
  username: `user-${Date.now()}`,
};
const participants = {};

const setVideoStream = (videoElement, stream) => {
  if ("srcObject" in videoElement) {
    videoElement.srcObject = stream;
  } else {
    videoElement.src = window.URL.createObjectURL(stream);
  }

  videoElement.play();
  videoElement.muted = true;
};

const refreshParticipantsList = () => {
  const container = document.getElementById("participants");
  container.textContent = ""; // remove all participants

  Object.entries(participants).forEach(p => {
    const participantElement = document.createElement("div");
    let displayName = p[1].username;
    let stream = p[1].stream;
    const participantName = document.createElement("p");
    participantName.innerText = displayName;
    const v = document.createElement("video");
    participantElement.appendChild(v);
    participantElement.appendChild(participantName);
    container.appendChild(participantElement);
    console.log(stream);
    if (stream) {
      setVideoStream(v, stream);
    }
  });
};

const updateMyVideo = () => {
  if (!me.stream) {
    return;
  }

  const videoElement = document.querySelector("#me > video");
  setVideoStream(videoElement, me.stream);
}

const userIdFromUsername = (username) => {
  return parseInt(username.replace(/^user-/, ""));
}

(async () => {
  document.getElementById("my-username").innerText = me.username;
  me.stream = await navigator.mediaDevices.getUserMedia(constraints);

  updateMyVideo();

  // start by saying hello!
  socket.emit("new user", {
    username: me.username,
    room: roomName,
  });

  socket.on("new user", async (data) => {
    data.map(async (user) => {
      if (user === me.username) {
        return;
      }

      if (!participants.hasOwnProperty(user)) {
        participants[user] = {
          username: user,
        };
      }

      if (!participants[user].hasOwnProperty("pc")) {
        const pc = new RTCPeerConnection(rtcConfiguration);
        me.stream.getTracks().forEach((track) => pc.addTrack(track, me.stream));
        pc.addEventListener("icecandidate", (e) => {
          socket.emit("msg", {
            type: "icecandidate",
            from: me.username,
            to: user,
            data: e.candidate,
          });
        });
        pc.addEventListener("track", (e) => {
          console.log("got track from", user, e)
          const stream = e.streams[0];
          if (!participants[user].hasOwnProperty("stream") || participants[user].stream !== stream) {
            participants[user].stream = stream;
          }
          refreshParticipantsList();
        });
        participants[user].pc = pc;

        if (userIdFromUsername(me.username) < userIdFromUsername(user)) {
          const offer = await participants[user].pc.createOffer(offerOptions);
          await participants[user].pc.setLocalDescription(offer);

          socket.emit("msg", {
            type: "offer",
            from: me.username,
            to: user,
            data: offer,
          });
        }
      }
    });
    refreshParticipantsList();
  });

  socket.on("user disconnected", function (userName) {
    console.log(userName);
    if (participants.hasOwnProperty(userName)) {
      delete participants[userName];
      refreshParticipantsList();
    }
  });

  socket.on("msg", async (data) => {
    console.log(data);

    // mal-formed messages
    if (!data.type || !data.to || !data.from || data.to !== me.username) {
      return;
    }

    // got a message from someone that is not in the participants list ; ignore it
    if (!participants.hasOwnProperty(data.from)) {
      return;
    }

    if (data.type === "offer") {
      if (!participants[data.from].hasOwnProperty("pc")) {
        console.error(`no peer connection with ${data.from}`);
        return;
      }

      participants[data.from].pc.setRemoteDescription(data.data);
      const answer = await participants[data.from].pc.createAnswer();
      await participants[data.from].pc.setLocalDescription(answer);
      socket.emit("msg", {
        type: "answer",
        from: me.username,
        to: data.from,
        data: answer,
      });
    }

    if (data.type === "answer") {
      if (!participants[data.from].hasOwnProperty("pc")) {
        console.error(`no peer connection with ${data.from}`);
        return;
      }
      participants[data.from].pc.setRemoteDescription(data.data);
    }

    if (data.type === "icecandidate") {
      if (!participants[data.from].hasOwnProperty("pc")) {
        console.error(`no peer connection with ${data.from}`);
        return;
      }
      participants[data.from].pc.addIceCandidate(data.data);
    }
  });
})();
