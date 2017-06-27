/* eslint-disable react/prop-types, react/prefer-stateless-function */
import React from 'react';
import { createContainer } from '../../src';
import { expect } from 'chai';

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

export const FineGrabReturnContainer = createContainer(BasicComponent, {
  fetch: {
    first: {
      as: () => null,
      grab: () => () => false,
    },
    second: {
      as: () => null,
      grab: () => () => 'someVal', // If both return falsey then the grabs won't be run
    },
  },
  failed(WrappedBasicComponent) {
    return <WrappedBasicComponent {...this.props}>Failed</WrappedBasicComponent>;
  },
});

export const BadGrabReturnContainer = createContainer(BasicComponent, {
  fetch: {
    first: {
      as: () => null,
      grab: () => () => undefined,
    },
    second: {
      as: () => null,
      grab: () => () => 'someVal', // If both return falsey then the grabs won't be run
    },
  },
  failed(WrappedBasicComponent) {
    return <WrappedBasicComponent {...this.props}>Failed</WrappedBasicComponent>;
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

const sampleMethod = () => {
};

export class QuickMethodComponent extends React.Component {
  render() {
    return <div />;
  }
}

export const QuickMethodContainer = createContainer(QuickMethodComponent, {
  quickMethods: {
    sampleMethod,
  },
});


export const PropsParseContainer = createContainer(QuickMethodComponent, {
  propTransform: (props) => {
    return {
      ...props,
      id: parseInt(props.id, 10),
    };
  },

  fetch: {
    integer: {
      as: (state, props) => expect(props.id).to.be.a('Number'),
    },
  },
});

class TriggerStateChangeComponent extends React.Component {
  componentDidMount() {
    if (this.props.count < 1) {
      this.props.increment();
    }
  }

  render() {
    return <div />;
  }
}

export const ReGrabContainer = createContainer(TriggerStateChangeComponent, {
  fetch: {
    count: {
      as: state => state.refreshTestCounter,
      grab: (dispatch, props) => () => {
        return props.fn();
      },
      refreshGrabInResponse: ['REFRESH_TEST_INCREMENT'],
    },
  },
  methods: {
    increment: dispatch => () => {
      dispatch({ type: 'REFRESH_TEST_INCREMENT' });
    },
  },
});
