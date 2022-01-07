/**
 * Manage current user.
 */

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

type State = {
  id: string,
  displayName: string;
  room: string;
  stream?: MediaStream;
};

const initialState: State = {
  id: `init-${Date.now()}`,
  displayName: names[Math.floor(Math.random() * names.length)],
  room: "default",
  stream: undefined,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'USER_UPDATE_ID':
      return {
        ...state,
        id: action.payload,
      };

    case 'USER_UPDATE_STREAM':
      return {
        ...state,
        stream: action.payload,
      };

    default:
      return state;
  }
}

export default userReducer;
