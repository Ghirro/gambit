/* eslint-env mocha */
import { expect } from 'chai';
import { GambitApi } from '../../src';

describe('GambitApi', () => {
  const api = new GambitApi({
    users: {
      getUsers() {
        return this.get({ url: '/user' });
      },
      createUser() {
        return this.post({ url: '/user' });
      },
    },
  }, '/');

  api.setFetchLib(async () => {
    return new Promise(resolve => {
      setTimeout(() => resolve('hi'), 0);
    });
  });

  it('should have the correct methods', () => {
    expect(api.users).to.have.property('getUsers');
    expect(api.users.getUsers).to.be.a('function');
  });

  it('should correctly call those api methods', async () => {
    const { body } = await api.users.getUsers({});
    expect(body).to.equal('hi');
  });
});
