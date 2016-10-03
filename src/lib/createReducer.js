import { Map } from 'immutable';
import immutableReducers from './immutableReducers';
import { combineReducers } from 'redux';
import forIn from 'lodash/forIn';
import Constants from './GeneralConstants';
import wrapperCreate from './wrappedState';

function handlePossibleImmutable(object) {
  if (!object) return [object];
  if (object.toJS) return ['IMMUTABLE', object.toJS()];
  return [object];
}

export default function manufactureReducer(
  tree,
  { hearGeneral = false, asImmutable = true, strictMode = false, logging = false } = {},
) {
  let reducers = asImmutable ? new Map({}) : {};

  if (strictMode) {
    forIn(tree, (value, key) => {
      const innerMethods = value[1];
      Object.keys(innerMethods)
        .forEach((constantPassed) => {
          if (
            constantPassed.indexOf('DONE') === -1 &&
            constantPassed.indexOf('FAILED') === -1 &&
            constantPassed.indexOf('STARTING') === -1 &&
            !Constants[constantPassed] &&
            strictMode
          ) {
            const warn = console.warn;
            warn(`Constant in reducer w/o DONE/FAILED/STARTING: ${constantPassed} on key ${key}`);
            warn('To suppress this warning, turn off strictMode');
          }
          return constantPassed;
        });
    });
  }

  forIn(tree, (value, key) => {
    const [defaultState, innerMethods] = value;

    const method = (prevState = defaultState, { type, ...rest }) => {
      if (type === Constants.ACTION_CALLED && !hearGeneral) return prevState;

      // NB: The way we do constant matching could be done better
      return Object.keys(innerMethods)
        .reduce((prev, matchingConstants) => {
          const response = innerMethods[matchingConstants];
          const doesMatch = matchingConstants
            .trim()
            .split(' ')
            .some(x => x === type.trim());

          if (!doesMatch) return prev;

          const log = console.log;
          if (logging) {
            const styles = 'background: blue; color: white; font-size: 14px';
            log(' ');
            log('%c ----', 'color: blue');
            log(`%c "${key}": ${matchingConstants}`, styles);
            log(rest);
            log('Starting as: ', ...handlePossibleImmutable(prevState));
          }

          const stateObj = (strictMode || logging) ?
            wrapperCreate(prevState, { key, strictMode, logging }) :
            prevState;

          const resp = typeof response === 'function' ? response(rest, stateObj) : response;


          if (logging) {
            log('Ending as: ', ...handlePossibleImmutable(resp));
            log('%c ----', 'color: blue');
            log(' ');
          }

          return resp;
        }, prevState);
    };

    reducers = asImmutable ? reducers.set(key, method) : { ...reducers, [key]: method };
  });

  return asImmutable ?
    immutableReducers(reducers, { strictMode, logging }) :
    combineReducers(reducers);
}
