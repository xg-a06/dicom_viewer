const TASK_TYPE = {
  PRIOR: 'PRIOR',
  NORMAL: 'NORMAL'
}

const EVENTS = {
  RESIZE: 'RESIZE',
  LOADED: 'LOADED'
}

const WWWC = {
  LUNG: {
    ww: 1500,
    wc: -600
  }
}

const LAYOUT = {
  'L1x1': 'L1x1',
  'L1x2': 'L1x2',
  'L2x1': 'L2x1',
  'L2+1': 'L2+1',
  'L1+2': 'L1+2',
  'L1x3': 'L1x3',
  'L2x2': 'L2x2',
  'L1+3': 'L1+3',
  'L3x3': 'L3x3',
}

const TXEVENTS = {
  TOUCHDOWN: 'TX_TOUCHDOWN',
  TOUCHUP: 'TX_TOUCHUP',
  TAP: 'TX_TAP',
  TOUCHMOVE: 'TX_TOUCHMOVE',
  MOVE: 'TX_MOVE',
}

const TOOLTYPES = {
  WWWC: 'TX_WWWC',
  MOVE: 'TX_MOVE',
  SCALE: 'TX_SCALE'
}

export {
  TASK_TYPE,
  EVENTS,
  WWWC,
  LAYOUT,
  TXEVENTS,
  TOOLTYPES
}