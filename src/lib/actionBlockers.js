export function hasNotBeenCalled(foundCalled) {
  return !foundCalled;
}

export function hasNotSucceeded(foundCalled, foundSucceeded) {
  return !foundSucceeded;
}

export function hasNotBeenCalledIn(time, units) {
  let seconds = 0;
  switch (units) {
    case 'hours':
    case 'hrs':
    case 'hr':
    case 'h':
      seconds = 1000 * 60 * 60;
      break;
    case 'minutes':
    case 'mins':
    case 'min':
    case 'm':
      seconds = 1000 * 60;
      break;
    case 'seconds':
    case 'secs':
    case 'sec':
    case 's':
    default:
      seconds = time;
      break;
  }

  return (foundCalled) => {
    if (!foundCalled) return true;
    return Date.now() > (foundCalled + seconds);
  };
}

export function hasNotSucceededIn(time, units) {
  let seconds = 0;
  switch (units) {
    case 'hours':
    case 'hrs':
    case 'hr':
    case 'h':
      seconds = 1000 * 60 * 60;
      break;
    case 'minutes':
    case 'mins':
    case 'min':
    case 'm':
      seconds = 1000 * 60;
      break;
    case 'seconds':
    case 'secs':
    case 'sec':
    case 's':
    default:
      seconds = time;
      break;
  }

  return (foundCalled, foundSucceeded) => {
    if (!foundSucceeded) return true;
    return Date.now() > (foundSucceeded + seconds);
  };
}
