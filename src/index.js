// RESET function, NOTE THIS IS OFTEN IMPURE
// What meta info do you want performed? Good for timing handling
//
var i = 0;
var lastTime;
export const reset = async (t, fn) => {
  console.log('reset run');
  // FINISH TIMING THE LAST TEST
  if (i > 0) {
    console.timeEnd("test" + i);
  } else {
    i++;
    console.log('incremented i to ', i);
  }
  // THIS FUNCTION IS UNTIMED BECAUSE IT IS RESET TIME
  await fn(t);
  // START TIMING AGAIN
  // We're at the beginning of our next test so start the timer
  console.time("test" + i);
};
// END RESET FUNCTION

// WRAPPER FUNCTION
//
// This wraps the reset function and passes it the crawler function.
// This probably should be curried eventually, but for now we'll create it by
// hand
export const resetWith = fn => {
  return t => reset(t, fn);
};
// END WRAPPER

// Creates a start function
export const createStart = fn => {
  return () => {
    return resetWith(fn)
  };
}

// Creates a finish function
export const createFinish = fn => {
  return (t) => {
    return fn()(t)
  }
}

// Creates start and finish functions in the right order since finish relies
// on start
export const timecafe = fn => {
  const start = createStart(fn);
  return {
    start,
    finish: createFinish(start)
  }
}
