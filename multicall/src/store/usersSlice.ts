/**
 * Manage other users.
 */

const initialState = {};

const usersReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'USERS_SET':
      return action.payload;

    case 'USERS_SET_STREAM':
      return (state.hasOwnProperty(action.payload.id)) ? {...state, [action.payload.id]: {...state[action.payload.id], stream: action.payload.stream}} : state;

    default:
      return state;
  }
}

export default usersReducer;
