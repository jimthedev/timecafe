// RESET function, NOTE THIS IS OFTEN IMPURE
// What meta info do you want performed? Good for timing handling
//
var hrstart, hrend;
export const reset = async (t, fn) => {
  // FINISH TIMING THE LAST TEST
  if (hrstart) {
    console.log("\n\n")
    //console.timeEnd('   '  + i);
    hrend = process.hrtime(hrstart);
    console.log("   Done in " + (hrend[0] + hrend[1]/1000000000) + 's.');
  }

  // THIS FUNCTION IS UNTIMED BECAUSE IT IS RESET TIME
  await fn(t);
  // START TIMING AGAIN
  // We're at the beginning of our next test so start the timer
  //console.time('   '  + i);
  hrstart = process.hrtime()
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
const timecafe = fn => {
  const start = createStart(fn);
  return {
    start,
    finish: createFinish(start)
  }
}
export default timecafe;
