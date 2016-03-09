/* eslint-disable react/prop-types, react/prefer-stateless-function */
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

const store = createStore((prevState = { counter: 0 }, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...prevState,
        counter: prevState.counter + 1,
      };
    case 'DECREMENT':
      return {
        ...prevState,
        counter: prevState.counter - 1,
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
