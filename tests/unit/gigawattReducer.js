/* eslint-env mocha */
import { expect } from 'chai';
import { gambitReducer } from '../../src';
import Constants from '../../src/lib/GeneralConstants';
import { Map } from 'immutable';

describe('Gambit Reducer', () => {
  it('updates correctly', () => {
    const ret = gambitReducer(
      new Map({}),
      { type: Constants.ACTION_CALLED, action: 'foo' },
    );
    expect(ret.getIn(['lastCalled', 'foo'])).to.be.gt(0);
    expect(ret.getIn(['lastCalled', 'foo'])).to.be.lt(Date.now() + 1);
  });
});
