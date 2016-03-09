/* eslint-env mocha */
import { expect } from 'chai';
import { createReducer, createConstants } from '../../src';
import { Map } from 'immutable';
import { combineReducers } from 'redux';

describe('Manufacturing Reducers', () => {
  it('should create an immutable reducer', () => {
    const simpleReducer = createReducer({
      number: [0, {
        INCREMENT: (_, prev) => prev + 1,
      }],
    });

    const ret = simpleReducer(new Map({}), { type: 'INCREMENT' });
    expect(ret.get('number')).to.equal(1);
  });

  it('should create a mutable reducer', () => {
    const simpleReducer = createReducer({
      number: [0, {
        INCREMENT: (_, prev) => prev + 1,
      }],
    }, { asImmutable: false });

    const ret = simpleReducer({}, { type: 'INCREMENT' });
    expect(ret.number).to.equal(1);
  });

  it('should match a function to multiple constants', () => {
    const Constants = createConstants(['ADD']);
    const simpleReducer = createReducer({
      number: [0, {
        [Constants.ADD_DONE + Constants.ADD_STARTING]: (_, prev) => prev + 1,
      }],
    });

    let ret = simpleReducer(undefined, { type: Constants.ADD_DONE });
    ret = simpleReducer(ret, { type: Constants.ADD_STARTING });
    expect(ret.get('number')).to.equal(2);
  });

  it('should work politely with combineReducers', () => {
    const users = createReducer({
      usernames: [new Map({}), {
        ADD_USER: ({ id, user }, prev) => prev.set(id, user.name),
      }],
    });

    const pets = createReducer({
      petNames: [{}, {
        ADD_USER: ({ id, petName }, prev) => {
          prev[id] = petName;
          return prev;
        },
      }],
    }, { asImmutable: false });

    const reducer = combineReducers({ users, pets });
    const ret = reducer({}, { type: 'ADD_USER', id: 1, petName: 'fido', user: { name: 'Jim' } });
    expect(ret.users.getIn(['usernames', 1])).to.equal('Jim');
    expect(ret.pets.petNames[1]).to.equal('fido');
  });
});
