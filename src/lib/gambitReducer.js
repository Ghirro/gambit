import createReducer from './createReducer';
import { Map, fromJS } from 'immutable';
import Constants from './GeneralConstants';

export default (opts = {}) => {
  return createReducer({
    lastCalled: [new Map({}), {
      [Constants.ACTION_CALLED]: ({
        action,
      }, prevState) => prevState.set(action, Date.now()),
    }],
    lastSucceeded: [new Map({}), {
      [Constants.ACTION_SUCCEEDED]: ({
        action,
      }, prevState) => prevState.set(action, Date.now()),
    }],
    monitorValues: [new Map({}), {
      [Constants.MONITORED_VALUE_CHANGED]: ({
        id,
        props,
        state,
      }, prevState) => prevState.set(id, fromJS({
        props,
        state,
      })),
    }],
    highlightedComponents: [new Map({}), {
      [Constants.HIGHLIGHT_COMPONENT]: ({
        id,
        color,
      }, state) => state.set(id, color),
      [Constants.UNHIGHLIGHT_COMPONENT]: ({
        id,
      }, state) => state.delete(id),
    }],
  }, { hearGeneral: true, ...opts });
};
