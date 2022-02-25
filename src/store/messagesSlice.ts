/**
 * Manage chat messages.
 */

const initialState = [];

const messagesReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'MESSAGES_SENT':
      if (!action.payload.id) {
        return state;
      }

      return [...state, {
        time: Date.now(),
        sent: true,
        id: action.payload.id,
        from: action.payload.from || undefined,
        type: action.payload.type || "chat",
        data: action.payload.data,
      }];

    case 'MESSAGES_RECEIVED':
      if (!action.payload.id) {
        return state;
      }

      return [...state, {
        time: Date.now(),
        sent: false,
        id: action.payload.id,
        from: action.payload.from || undefined,
        type: action.payload.type || "chat",
        data: action.payload.data,
      }];

    case 'MESSAGES_SET_DOWNLOADING':
      if (!action.payload.id) {
        return state;
      }

      return state.map(m => {
        if (m.type !== "file" || m.id !== action.payload.id) {
          return m;
        }

        return {
          ...m,
          data: {
            ...m.data,
            status: "downloading",
          },
        };
      });

    case 'MESSAGES_SET_DOWNLOADED':
      if (!action.payload.id) {
        return state;
      }

      return state.map(m => {
        if (m.type !== "file" || m.id !== action.payload.id) {
          return m;
        }

        return {
          ...m,
          data: {
            ...m.data,
            status: "downloaded",
          },
        };
      });

    default:
      return state;
  }
}

export default messagesReducer;
