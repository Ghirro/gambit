/* eslint-disable max-len */
import invariant from 'invariant';
import { Map } from 'immutable';
import {
  integerAsString,
  valueUndefined,
  keyUndefined,
  keyIsArray,
  keyIsntArray,
} from './dict';

const alteringMethods = [
  'updateIn',
  'deleteIn',
  'delete',
  'update',
  'merge',
  'mergeIn',
  'mergeWith',
  'mergeDeepWith',
  'mergeDeep',
  'mergeIn',
  'mergeDeepIn',
];

function confirmInteger(args, { key, target, type }) {
  if (!Array.isArray(args)) {
    args = [args];
  }

  args.forEach(argument => {
    invariant(
      typeof argument !== 'string' ||
      isNaN(parseInt(argument, 10)) ||
      argument.length !== parseInt(argument, 10).toString().length,
      integerAsString(type, argument, key, args)
    );
  });
}

function confirmNotUndefined(setKey, setValue, { key, target }) {
  setKey = Array.isArray(setKey) ? setKey : [setKey];

  invariant(
    typeof setValue !== 'undefined',
    valueUndefined(setKey, key),
  );
}

function confirmKeyNotUndefined(setKey, { key, type }) {
  setKey = Array.isArray(setKey) ? setKey : [setKey];

  invariant(
    setKey.indexOf(undefined) === -1 &&
    setKey.indexOf('undefined') === -1,
    keyUndefined(setKey, key)
  );
}

function confirmCorrectCall(name, setKey, { key, type }) {
  if (Array.isArray(setKey)) {
    invariant(
      (name === 'setIn' || name === 'getIn'),
      keyIsArray(setKey, key, type)
    );
  }

  if (!Array.isArray(setKey)) {
    invariant(
      (name === 'set' || name === 'get'),
      keyIsntArray(setKey, key, type)
    );
  }
}

export default function wrappedStateFactory(stateObj, { key, strictMode }) {
  const self = wrappedStateFactory;
  const handler = {
    get(target, name) {
      if (name === 'isProxied') {
        return true;
      }

      return (...args) => {
        try {
          if (name === 'set' || name === 'setIn') {
            if (strictMode) {
              confirmInteger(args[0], { key, target, type: 'set' });
              confirmNotUndefined(args[0], args[1], { key, target, type: 'set' });
              confirmKeyNotUndefined(args[0], { key, target, type: 'set' });
              confirmCorrectCall(name, args[0], { key, type: 'set' });
            }
            return self(target[name](...args), { key, strictMode });
          }


          if (
            alteringMethods.indexOf(name) !== -1
          ) {
            return self(target[name](...args), { key, strictMode });
          }


          if (name === 'get' || name === 'getIn') {
            if (strictMode) {
              confirmInteger(args[0], { key, target, type: 'get' });
              confirmKeyNotUndefined(args[0], { key, target, type: 'get' });
              confirmCorrectCall(name, args[0], { key, type: 'get' });
            }
            return target[name](...args);
          }
        } catch (e) {
          console.warn(e);
        }

        return target[name](...args);
      };
    },
  };

  if (Map.isMap(stateObj) && !stateObj.isProxied) {
    return new Proxy(stateObj, handler);
  }
  return stateObj;
}
