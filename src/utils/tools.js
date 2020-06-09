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



function getEquipment () {
  let UA = navigator.userAgent;
  let isAndroid = /android|adr|linux/gi.test(UA);
  let isIOS = /iphone|ipod|ipad/gi.test(UA) && !isAndroid;
  let isBlackBerry = /BlackBerry/i.test(UA);
  let isWindowPhone = /IEMobile/i.test(UA);
  let isMobile = isAndroid || isIOS || isBlackBerry || isWindowPhone;
  return {
    isAndroid: isAndroid,
    isIOS: isIOS,
    isMobile: isMobile,
    isWeixin: /MicroMessenger/gi.test(UA),
    isQQ: /QQ/gi.test(UA),
    isWeibo: /WeiBo/gi.test(UA),
    isPC: !isMobile
  }
}

export {
  noop,
  sleep,
  debounce,
  throttle,
  getNumberValues,
  getEquipment
}