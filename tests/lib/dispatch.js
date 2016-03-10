import { Map } from 'immutable';
import Constants from '../../src/lib/GeneralConstants';

function initialState() {
  return {
    gambit: new Map({
      lastCalled: new Map({}),
    }),
  };
}
export default function dispatchCreator(api) {
  let stack = [];
  let ids = [];
  let state = initialState();

  return {
    dispatch: actionMethod => {
      const internalDispatcher = dispatchObj => {
        if (dispatchObj.type === Constants.ACTION_CALLED) {
          ids.push(dispatchObj.action);
          state.gambit = state.gambit.setIn(['lastCalled', dispatchObj.action], Date.now());
        }
        stack.push(dispatchObj);
      };
      const fakeState = () => state;
      return actionMethod(api, internalDispatcher, fakeState);
    },
    last: () => {
      const ret = stack.pop();
      return ret;
    },
    lastId: () => {
      const ret = ids.pop();
      return ret;
    },
    clear: () => {
      stack = [];
    },
    clearStack: () => {
      stack = [];
      ids = [];
    },
    clearState: () => {
      state = initialState();
    },
  };
}
