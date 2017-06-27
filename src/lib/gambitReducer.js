import createReducer from './createReducer';
import { Map, fromJS } from 'immutable';
import Constants from './GeneralConstants';

export default (opts = {}) => {
  return createReducer({
    lastAction: [null, {
      [Constants.ACTION_CALLED]: ({
        action,
      }) => action,
    }],
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
    pending: [new Map({}), {
      [Constants.ACTION_CALLED]: ({
        cycleId,
      }, prevState) => {
        if (!cycleId) return prevState;
        return prevState.set(cycleId, true);
      },
      [Constants.ACTION_SUCCEEDED + ' ' + Constants.ACTION_FAILED]: ({
        cycleId,
      }, prevState) => {
        if (!cycleId) return prevState;
        return prevState.set(cycleId, false);
      },
    }],
    failed: [new Map({}), {
      [Constants.ACTION_CALLED + ' ' + Constants.ACTION_SUCCEEDED]: ({
        cycleId,
      }, prevState) => {
        if (!cycleId) return prevState;
        return prevState.set(cycleId, null);
      },
      [Constants.ACTION_FAILED]: ({
        cycleId,
        ...rest,
      }, prevState) => {
        if (!cycleId) return prevState;
        return prevState.set(
          cycleId,
          opts.errorParser ? opts.errorParser({ cycleId, ...rest }) : true,
        );
      },
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
  }, { ...opts, hearGeneral: true });
};
