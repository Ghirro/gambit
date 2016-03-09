// NB: The space allows for split matching when reducers are checked
export default function createConstants(arr = []) {
  return arr.reduce((prev, curr) => {
    prev[`${curr}_STARTING`] = ` ${curr}_STARTING`;
    prev[`${curr}_DONE`] = ` ${curr}_DONE`;
    prev[`${curr}_FAILED`] = ` ${curr}_FAILED`;
    prev[curr] = curr;
    return prev;
  }, {});
}
