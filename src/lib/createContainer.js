import { connect } from 'react-redux';
import containerFactory from './Gambit';

export default function createContainer(
  InnerComp,
  {
    fetch = {},
    methods = {},
    quickMethods = {},
    done,
    pending,
    failed,
    propTransform,
  } = {}
) {
  fetch = {
    ...fetch,
    debugHighlighted: {
      as: state => state.gambit && state.gambit.get('highlightedComponents'),
    },
  };

  methods = {
    ...Object.keys(quickMethods)
      .reduce((prev, curr) => {
        const f = quickMethods[curr];
        return {
          ...prev,
          [curr]: dispatch => args => dispatch(f(args)),
        };
      }, {}),
    ...methods,
  };

  const Container = containerFactory(
    InnerComp,
    { fetch, methods, done, pending, failed, propTransform }
  );
  return connect()(Container);
}
