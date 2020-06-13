/* eslint-disable no-unused-vars */
import { TX_EVENTS, EVENTS } from '../../const'
import { getEquipment, throttle } from '../../utils/tools'
import Hammer, { Pan, Pinch } from 'hammerjs'

const whichEventMap = {
  '1': {
    down: TX_EVENTS.TOUCHDOWN,
    up: TX_EVENTS.TOUCHUP,
    tap: TX_EVENTS.TAP,
    touchmove: TX_EVENTS.TOUCHMOVE
  },
  '2': {
    down: TX_EVENTS.MIDDLE_TOUCHDOWN,
    up: TX_EVENTS.MIDDLE_TOUCHUP,
    click: TX_EVENTS.MIDDLE_TAP,
    touchmove: TX_EVENTS.MIDDLE_TOUCHMOVE
  },
  '3': {
    down: TX_EVENTS.RIGHT_TOUCHDOWN,
    up: TX_EVENTS.RIGHT_TOUCHUP,
    click: TX_EVENTS.RIGHT_TAP,
    touchmove: TX_EVENTS.RIGHT_TOUCHMOVE
  },

}

const equ = getEquipment();

function calPoints (viewport, e) {
  const { displayState: { area, ratio } } = viewport
  let { clientX, clientY, target } = e;
  const { offsetLeft, offsetTop } = target.parentElement;
  const offsetX = clientX - offsetLeft;
  const offsetY = clientY - offsetTop;
  let imageX = Math.round((clientX - offsetLeft - area.x) / ratio)
  let imageY = Math.round((clientY - offsetTop - area.y) / ratio)
  e.info = {
    el: target,
    clientX,
    clientY,
    offsetX,
    offsetY,
    imageX,
    imageY,
    viewport,
  }
}

function attachEvent (viewport) {
  const { manager, canvas } = viewport;
  if (equ.isMobile) {
    let startX; let startY; let endX; let endY; let isTouch = false;
    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length > 1) {
        isTouch = false;
        return;
      }
      isTouch = true;
      const touches = e.touches[0];
      startX = touches.clientX;
      startY = touches.clientY;
      e.clientX = startX;
      e.clientY = startY;
      calPoints(viewport, e)
      manager.emit(TX_EVENTS.TOUCHDOWN, e)
    });

    canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 1) {
        return;
      }
      isTouch = false;
      const touches = e.changedTouches[0];
      endX = touches.clientX;
      endY = touches.clientY;
      e.clientX = endX;
      e.clientY = endY;
      calPoints(viewport, e)
      manager.emit(TX_EVENTS.TOUCHUP, e)
      if (Math.abs(startX - endX) < 10 && Math.abs(startY - endY) < 10) {
        manager.emit(TX_EVENTS.TAP, e)
      }
    });
    canvas.addEventListener('touchmove', throttle((e) => {
      if (e.changedTouches.length > 1 || !isTouch) {
        return;
      }
      const touches = e.changedTouches[0];
      e.clientX = touches.clientX;
      e.clientY = touches.clientY;
      calPoints(viewport, e)
      manager.emit(TX_EVENTS.TOUCHMOVE, e)
    }, 30))

    const hammer = new Hammer(canvas);
    hammer.get('pinch').set({ enable: true });
    hammer.add(new Pan({ pointers: 2 }));
    hammer.add(new Pinch({ threshold: 0.1 }));
    hammer.on('panstart', (e) => {
      const { x, y } = e.center;
      e.clientX = x;
      e.clientY = y;
      calPoints(viewport, e)
      manager.emit(TX_EVENTS.PIN_TOUCHDOWN, e)
    })
    hammer.on('panmove', throttle((e) => {
      const { x, y } = e.center;
      e.clientX = x;
      e.clientY = y;
      calPoints(viewport, e)
      manager.emit(TX_EVENTS.PIN_TOUCHMOVE, e)
    }, 30))
    hammer.on('panend', (e) => {
      const { x, y } = e.center;
      e.clientX = x;
      e.clientY = y;
      calPoints(viewport, e)
      manager.emit(TX_EVENTS.PIN_TOUCHUP, e)
    })
    hammer.on('pinchstart', (e) => {
      e.pinchScale = e.scale;
      calPoints(viewport, e)
      manager.emit(TX_EVENTS.PINCH_TOUCHDOWN, e)
    })
    hammer.on('pinchmove', throttle((e) => {
      e.pinchScale = e.scale;
      calPoints(viewport, e)
      manager.emit(TX_EVENTS.PINCH_TOUCHMOVE, e)
    }, 30))
    hammer.on('pinchend', (e) => {
      e.pinchScale = e.scale;
      calPoints(viewport, e)
      manager.emit(TX_EVENTS.PINCH_TOUCHUP, e)
    })
  } else {
    let isTouch = false;
    canvas.addEventListener('mousedown', (e) => {
      isTouch = true;
      calPoints(viewport, e)
      manager.emit(whichEventMap[e.which].down, e)
    })
    canvas.addEventListener('mouseup', (e) => {
      isTouch = false;
      calPoints(viewport, e)
      manager.emit(whichEventMap[e.which].up, e)
    })
    canvas.addEventListener('click', (e) => {
      isTouch = false;
      calPoints(viewport, e)
      manager.emit(whichEventMap[e.which].tap, e)
    })
    canvas.addEventListener('mousemove', throttle((e) => {
      manager.emit(TX_EVENTS.MOUSEMOVE, e)
      if (isTouch) {
        calPoints(viewport, e)
        manager.emit(whichEventMap[e.which].touchmove, e)
      }
    }, 30))
    canvas.addEventListener('mouseout', (e) => {
      isTouch = false;
      manager.emit(TX_EVENTS.MOUSEOUT, e)
    })
    canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
    })
  }
}

export default attachEvent;