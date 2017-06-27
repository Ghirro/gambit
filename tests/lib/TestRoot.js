/* eslint-disable react/prop-types, react/prefer-stateless-function */
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { Map } from 'immutable';

const initialState = {
  counter: 0,
  refreshTestCounter: 0,
  gambit: new Map({
    lastCalled: null,
  }),
};

const store = createStore((prevState = initialState, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...prevState,
        counter: prevState.counter + 1,
        gambit: prevState.gambit.set('lastAction', 'INCREMENT'),
      };
    case 'DECREMENT':
      return {
        ...prevState,
        counter: prevState.counter - 1,
        gambit: prevState.gambit.set('lastAction', 'DECREMENT'),
      };
    case 'REFRESH_TEST_INCREMENT':
      return {
        ...prevState,
        refreshTestCounter: prevState.refreshTestCounter + 1,
        gambit: prevState.gambit.set('lastAction', 'REFRESH_TEST_INCREMENT'),
      };
    default:
      return prevState;
  }
});

function ProviderWithStore({ children }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}

// Annoyingly has to be a Class-based component for test rendering
export default class TestRoot extends React.Component {
  static propTypes = {
    children: React.PropTypes.any,
  };

  render() {
    return (
      <ProviderWithStore>
        {this.props.children}
      </ProviderWithStore>
    );
  }
}
