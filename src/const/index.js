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


const TX_EVENTS = {
  TOUCHDOWN: 'TX_TOUCHDOWN',
  TOUCHUP: 'TX_TOUCHUP',
  TAP: 'TX_TAP',
  TOUCHMOVE: 'TX_TOUCHMOVE',
  MOUSEMOVE: 'TX_MOUSEMOVE',
  MOUSEOUT: 'TX_MOUSEOUT',
  MIDDLE_TOUCHDOWN: 'TX_MIDDLE_TOUCHDOWN',
  MIDDLE_TOUCHUP: 'TX_MIDDLE_TOUCHUP',
  MIDDLE_TAP: 'TX_MIDDLE_TAP',
  MIDDLE_TOUCHMOVE: 'TX_MIDDLE_TOUCHMOVE',
  RIGHT_TOUCHDOWN: 'TX_RIGHT_TOUCHDOWN',
  RIGHT_TOUCHUP: 'TX_RIGHT_TOUCHUP',
  RIGHT_TAP: 'TX_RIGHT_TAP',
  RIGHT_TOUCHMOVE: 'TX_RIGHT_TOUCHMOVE',
  PIN_TOUCHDOWN: 'PIN_TOUCHDOWN',
  PIN_TOUCHUP: 'PIN_TOUCHUP',
  PIN_TOUCHMOVE: 'PIN_TOUCHMOVE',
  PINCH_TOUCHDOWN: 'PINCH_TOUCHDOWN',
  PINCH_TOUCHUP: 'PINCH_TOUCHUP',
  PINCH_TOUCHMOVE: 'PINCH_TOUCHMOVE',
  RENDERED: 'TX_RENDER'
}

const TOOL_TYPES = {
  WWWC: 'TX_WWWC',
  MOVE: 'TX_MOVE',
  SCALE: 'TX_SCALE',
  STACKSCROLL: 'TX_STACKSCROLL',
  SCALEBAR: 'SCALEBAR'
}

const SHORTCUT_KEYS = {
  MIDDLE_BUTTON: 'MIDDLE_BUTTON',
  RIGHT_BUTTON: 'RIGHT_BUTTON',
  PIN: 'PIN',
  PINCH: 'PINCH'
}

export {
  TASK_TYPE,
  EVENTS,
  WWWC,
  LAYOUT,
  TX_EVENTS,
  TOOL_TYPES,
  SHORTCUT_KEYS
}