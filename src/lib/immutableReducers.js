import { Map } from 'immutable';

export default (reducers) => (prevState = new Map({}), action) => {
  return reducers.reduce((prev, value, key) => {
    return prev.set(key, value.call(this, prevState.get(key), action));
  }, new Map({}));
};
