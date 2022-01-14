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

    case 'MESSAGES_RECEIVED_PART_FILE':
      if (!action.payload.id) {
        return state;
      }

      return state.map(m => {
        if (m.id !== action.payload.id) {
          return m;
        }

        const content = m.data.content.concat(action.payload.data);
        const complete = action.payload.last;

        return {
          ...m,
          data: {
            ...m.data,
            complete,
            content,
          }
        };
      });

    default:
      return state;
  }
}

export default messagesReducer;
