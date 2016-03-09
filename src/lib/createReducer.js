import { Map } from 'immutable';
import immutableReducers from './immutableReducers';
import { combineReducers } from 'redux';
import forIn from 'lodash/forIn';
import Constants from './GeneralConstants';

export default function manufactureReducer(
  tree,
  { hearGeneral = false, asImmutable = true } = {},
) {
  let reducers = asImmutable ? new Map({}) : {};

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
          return typeof response === 'function' ? response(rest, prevState) : response;
        }, prevState);
    };

    reducers = asImmutable ? reducers.set(key, method) : { ...reducers, [key]: method };
  });

  return asImmutable ?
    immutableReducers(reducers) :
    combineReducers(reducers);
}
