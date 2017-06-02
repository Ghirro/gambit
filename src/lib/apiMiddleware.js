export default function middlewareCreate(api, ...rest) {
  return store => next => action => {
    if (typeof action === 'function') {
      return action(api, store.dispatch, store.getState, ...rest);
    }
    return next(action);
  };
}
