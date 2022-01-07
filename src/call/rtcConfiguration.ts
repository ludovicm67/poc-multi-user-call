const rtcConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    /*{
      urls: "turn:example.com:3478",
      credentialType: "password" as "password",
      username: "public",
      credential: "public",
    },*/
  ],
};

export default rtcConfiguration;
