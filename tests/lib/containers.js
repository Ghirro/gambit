/* eslint-disable react/prop-types, react/prefer-stateless-function */
import React from 'react';
import { createContainer } from '../../src';

export class CounterComponent extends React.Component {
  static propTypes = {
    counter: React.PropTypes.number.isRequired,
  };
  render() {
    return <div>{this.props.counter}</div>;
  }
}

export class MethodCounterComponent extends React.Component {
  static propTypes = {
    counter: React.PropTypes.number.isRequired,
    increment: React.PropTypes.func.isRequired,
  };
  render() {
    return <div onClick={this.props.increment}>{this.props.counter}</div>;
  }
}

function BasicComponent({ children }) { return <div>{children || 'Done'}</div>; }

export const BasicContainer = createContainer(BasicComponent, {
  done(ContainedBasicComponent) {
    return <ContainedBasicComponent {...this.props} />;
  },
});

export const DonelessContainer = createContainer(BasicComponent);

export const WithAsContainer = createContainer(CounterComponent, {
  fetch: {
    counter: {
      as: state => state.counter,
    },
  },
});

export const WithMethodsContainer = createContainer(MethodCounterComponent, {
  fetch: {
    counter: {
      as: state => state.counter,
    },
  },
  methods: {
    increment: (dispatch, props) => asVal => {
      return dispatch({ type: 'INCREMENT' });
    },
  },
});

export const BadAsContainer = createContainer(BasicComponent, {
  fetch: { counter: { as: 1 } },
});

export const BadGrabContainer = createContainer(BasicComponent, {
  fetch: {
    first: {
      as: () => null,
      grab: () => undefined,
    },
  },
});

export const DelayedFetchContainer = createContainer(BasicComponent, {
  fetch: {
    first: {
      as: () => null,
      grab: () => asVal => {
        return new Promise(resolve => setTimeout(() => resolve('something'), 50));
      },
    },
    second: {
      as: () => null,
      grab: () => asVal => {
        return new Promise(resolve => setTimeout(() => resolve('something'), 400));
      },
    },
  },
  pending(WrappedBasicComponent) {
    return <WrappedBasicComponent {...this.props}>Pending</WrappedBasicComponent>;
  },
});

export const AbortFetchContainer = createContainer(BasicComponent, {
  fetch: {
    first: {
      as: () => null,
      grab: () => asVal => {
        return new Promise((_, reject) => setTimeout(() => reject(new Error('AN ERROR!')), 0));
      },
    },
  },
  failed(WrappedBasicComponent) {
    return <WrappedBasicComponent {...this.props}>Failed</WrappedBasicComponent>;
  },
});
