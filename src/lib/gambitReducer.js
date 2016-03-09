import createReducer from './createReducer';
import { Map } from 'immutable';
import Constants from './GeneralConstants';

export default createReducer({
  lastCalled: [new Map({}), {
    [Constants.ACTION_CALLED]: ({
      action,
    }, prevState) => prevState.set(action, Date.now()),
  }],
}, { hearGeneral: true });
