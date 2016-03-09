import { connect } from 'react-redux';
import containerFactory from './Gambit';

export default function createContainer(
  InnerComp,
  {
    fetch = {},
    methods = {},
    done,
    pending,
    failed,
  } = {}
) {
  const Container = containerFactory(
    InnerComp,
    { fetch, methods, done, pending, failed }
  );
  return connect()(Container);
}
