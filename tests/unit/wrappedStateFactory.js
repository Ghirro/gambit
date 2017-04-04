/* eslint-env mocha */
import { expect } from 'chai';
import wrappedStateFactory from '../../src/lib/wrappedState';
import { Map } from 'immutable';
require('mocha-sinon');
require('proxy-polyfill');

describe('Wrapped State Factory', () => {
  beforeEach(function () {
    this.sinon.stub(console, 'warn');
  });

  it('should allow set to be called', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(wrappedState.set(1, 'dog').get(1)).to.equal('dog');
  });

  it('should throw when using an integer string as a key', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.set('1', 'dog');
    expect(console.warn.calledOnce).to.equal(true);
  });

  it('should return a wrapped state', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    const newState = wrappedState.set('dog', 'fido');
    newState.set('1', 'dog');
    expect(console.warn.calledOnce).to.equal(true);
  });

  it('should throw an error when an integer string as a key somewhere in a stack', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.setIn(['man', '1'], 'dog');
    expect(console.warn.calledOnce).to.equal(true);
  });

  it('should not throw when using an integer as a key', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.set(1, 'dog');
    expect(console.warn.calledOnce).to.equal(false);
  });

  it('should not throw an error when an integer as key somewhere in a stack', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.setIn(['man', 1], 'dog');
    expect(console.warn.calledOnce).to.equal(false);
  });

  it('should not throw when using an integer amongst other things', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.setIn(['man', 'dog1'], 'thing');
    expect(console.warn.calledOnce).to.equal(false);
  });

  it('should not mutate the actual state object in anyway', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.setIn(['man', '1'], 'dog');
    expect(console.warn.calledOnce).to.equal(true);

    expect(state.get('man', 'backup')).to.equal('backup');
    state.setIn(['man', '1'], 'dog');
    expect(console.warn.calledOnce).to.equal(true);
  });

  it('should not let me set anything as undefined', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.set('thing', undefined);
    expect(console.warn.calledOnce).to.equal(true);
  });

  it('should not mind if the state isnt a map', () => {
    const state = true;
    wrappedStateFactory(state, { key: 'foo', strictMode: true });
    expect(console.warn.calledOnce).to.equal(false);
  });

  it('should not let me use undefined as a key', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.set(undefined, 'fish');
    expect(console.warn.calledOnce).to.equal(true);
  });

  it('should not let me use undefined as a key in an array', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.setIn(['foo', undefined], 'fish');
    expect(console.warn.calledOnce).to.equal(true);
  });

  it('should not let use an array key with set', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.set(['foo', 'bar'], 'fish');
    expect(console.warn.calledOnce).to.equal(true);
  });

  it('should not let use a none array key with setIn', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.setIn('pish', 'fish');
    expect(console.warn.calledOnce).to.equal(true);
  });

  it('should not let use an array key with get', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.get(['foo', 'bar'], 'fish');
    expect(console.warn.calledOnce).to.equal(true);
  });

  it('should not let use a none array key with getIn', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.getIn('pish', 'fish');
    expect(console.warn.calledOnce).to.equal(true);
  });

  it('should not let me use undefined as a get key', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.get(undefined, 'fish');
    expect(console.warn.calledOnce).to.equal(true);
  });

  it('should not let me use undefined as a key in a get array', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.getIn(['foo', undefined], 'fish');
    expect(console.warn.calledOnce).to.equal(true);
  });


  it('should not throw an error when an integer as key somewhere in a stack', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.getIn(['man', 1], 'dog');
    expect(console.warn.calledOnce).to.equal(false);
  });

  it('should not throw when using an integer amongst other things', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.getIn(['man', 'dog1'], 'thing');
    expect(console.warn.calledOnce).to.equal(false);
  });

  it('should throw when using an integer string as a key', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.get('1', 'dog');
    expect(console.warn.calledOnce).to.equal(true);
  });

  it('should throw an error when an integer string as a key somewhere in a stack', () => {
    const state = new Map({});
    const wrappedState = wrappedStateFactory(state, { key: 'foo', strictMode: true });
    wrappedState.getIn(['man', '1'], 'dog');
    expect(console.warn.calledOnce).to.equal(true);
  });
});
