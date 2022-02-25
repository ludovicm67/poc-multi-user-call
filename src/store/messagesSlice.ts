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

    default:
      return state;
  }
}

export default messagesReducer;
