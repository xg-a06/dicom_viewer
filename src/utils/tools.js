function noop (data) {
  return data;
}

function sleep (milliSeconds) {
  return new Promise((resolve) => setTimeout(resolve, milliSeconds))
}

function debounce (fun, delay, ctx) {
  return function (...args) {
    let _this = ctx || this;
    clearTimeout(fun.id)
    fun.id = setTimeout(() => {
      fun.apply(_this, args)
    }, delay)
  }
}

function throttle (fun, delay, ctx) {
  let last = 0;
  return function (...args) {
    let _this = ctx || this;
    let now = new Date()
    if (now - last > delay) {
      fun.apply(_this, args)
      last = now;
    }
  }
}

function getNumberValues (dataSet, tag, minimumLength) {
  const values = [];
  const valueAsString = dataSet.string(tag);

  if (!valueAsString) {
    return;
  }
  const split = valueAsString.split('\\');

  if (minimumLength && split.length < minimumLength) {
    return;
  }
  for (let i = 0; i < split.length; i++) {
    values.push(parseFloat(split[i]));
  }

  return values;
}

export {
  noop,
  sleep,
  debounce,
  throttle,
  getNumberValues
}