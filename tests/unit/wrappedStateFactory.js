/* eslint-env mocha */
import { expect } from 'chai';
import wrappedStateFactory from '../../src/lib/wrappedState';
import { Map } from 'immutable';
require('proxy-polyfill');

describe('Wrapped State Factory', () => {

  it('should allow set to be called', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(wrappedState.set(1, 'dog').get(1)).to.equal('dog');
  });

  it('should throw when using an integer string as a key', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.set('1', 'dog');
    }).to.throw(Error);
  });

  it('should return a wrapped state', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    const newState = wrappedState.set('dog', 'fido');
    expect(() => {
      return newState.set('1', 'dog');
    }).to.throw(Error);
  });

  it('should throw an error when an integer string as a key somewhere in a stack', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.setIn(['man', '1'], 'dog');
    }).to.throw(Error);
  });

  it('should not throw when using an integer as a key', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.set(1, 'dog');
    }).not.to.throw(Error);
  });

  it('should not throw an error when an integer as key somewhere in a stack', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.setIn(['man', 1], 'dog');
    }).not.to.throw(Error);
  });

  it('should not throw when using an integer amongst other things', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.setIn(['man', 'dog1'], 'thing');
    }).not.to.throw(Error);
  });

  it('should not mutate the actual state object in anyway', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.setIn(['man', '1'], 'dog');
    }).to.throw(Error);

    expect(() => {
      expect(state.get('man', 'backup')).to.equal('backup');
      return state.setIn(['man', '1'], 'dog');
    }).not.to.throw(Error);
  });

  it('should not let me set anything as undefined', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.set('thing', undefined);
    }).to.throw(Error);
  });

  it('should not mind if the state isnt a map', () => {
    const state = true;
    expect(() => {
      wrappedStateFactory(state, { key: 'foo', strictMode: true });
    }).not.to.throw(Error);
  });

  it('should not let me use undefined as a key', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.set(undefined, 'fish');
    }).to.throw(Error);
  });

  it('should not let me use undefined as a key in an array', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.setIn(['foo', undefined], 'fish');
    }).to.throw(Error);
  });

  it('should not let use an array key with set', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.set(['foo', 'bar'], 'fish');
    }).to.throw(Error);
  });

  it('should not let use a none array key with setIn', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.setIn('pish', 'fish');
    }).to.throw(Error);
  });

  it('should not let use an array key with get', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.get(['foo', 'bar'], 'fish');
    }).to.throw(Error);
  });

  it('should not let use a none array key with getIn', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.getIn('pish', 'fish');
    }).to.throw(Error);
  });

  it('should not let me use undefined as a get key', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.get(undefined, 'fish');
    }).to.throw(Error);
  });

  it('should not let me use undefined as a key in a get array', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.getIn(['foo', undefined], 'fish');
    }).to.throw(Error);
  });


  it('should not throw an error when an integer as key somewhere in a stack', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.getIn(['man', 1], 'dog');
    }).not.to.throw(Error);
  });

  it('should not throw when using an integer amongst other things', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.getIn(['man', 'dog1'], 'thing');
    }).not.to.throw(Error);
  });

  it('should throw when using an integer string as a key', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.get('1', 'dog');
    }).to.throw(Error);
  });

  it('should throw an error when an integer string as a key somewhere in a stack', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(() => {
      return wrappedState.getIn(['man', '1'], 'dog');
    }).to.throw(Error);
  });
});
