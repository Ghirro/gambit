import { Map } from 'immutable';
import wrapperCreate from './wrappedState';

export default (reducers, { strictMode, logging }) => (prevState = new Map({}), action) => {
  const mapValue = strictMode || logging ?
    wrapperCreate(new Map({}), { strictMode, logging, key: 'topLevelReducer' }) :
    new Map({});

  return reducers.reduce((aggregate, value, key) => {
    return aggregate.set(key, value.call(this, prevState.get(key), action));
  }, mapValue);
};
