/* eslint-disable no-unused-vars */
import { TXEVENTS, EVENTS } from '../../const'
import { getEquipment, throttle } from '../../utils/tools'

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
    viewport
  }
}

function attachEvent (viewport) {
  const { manager, canvas } = viewport;
  if (equ.isMobile) {
    let startX, startY, endX, endY;
    canvas.addEventListener('touchstart', function (e) {
      const touches = e.touches[0];
      startX = touches.clientX;
      startY = touches.clientY;
      e.clientX = startX;
      e.clientY = startY;
      calPoints(viewport, e)
      manager.emit(TXEVENTS.TOUCHDOWN, e)
    });

    canvas.addEventListener('touchend', (e) => {
      const touches = e.changedTouches[0];
      endX = touches.clientX;
      endY = touches.clientY;
      e.clientX = endX;
      e.clientY = endY;
      calPoints(viewport, e)
      manager.emit(TXEVENTS.TOUCHUP, e)
      if (Math.abs(startX - endX) < 10 && Math.abs(startY - endY) < 10) {
        manager.emit(TXEVENTS.TAP, e)
      }
    });
    canvas.addEventListener('touchmove', throttle((e) => {
      const touches = e.changedTouches[0];
      e.clientX = touches.clientX;
      e.clientY = touches.clientY;
      calPoints(viewport, e)
      manager.emit(TXEVENTS.TOUCHMOVE, e)
    }, 30))

  } else {
    let isTouch = false;
    canvas.addEventListener('mousedown', (e) => {
      isTouch = true;
      calPoints(viewport, e)
      if (e.which === 1) {
        manager.emit(TXEVENTS.TOUCHDOWN, e)
      }
      else if (e.which === 2) {
        manager.emit(TXEVENTS.TOUCHDOWN, e)
      }
      else if (e.which === 3) {
        manager.emit(TXEVENTS.RIGHT_TOUCH_DOWN, e)
      }
    })
    canvas.addEventListener('mouseup', (e) => {
      isTouch = false;
      calPoints(viewport, e)
      if (e.which === 1) {
        manager.emit(TXEVENTS.TOUCHUP, e)
      }
      else if (e.which === 2) {
        manager.emit(TXEVENTS.TOUCHUP, e)
      }
      else if (e.which === 3) {
        manager.emit(TXEVENTS.RIGHT_TOUCH_UP, e)
      }

    })
    canvas.addEventListener('click', (e) => {
      isTouch = false;
      calPoints(viewport, e)
      manager.emit(TXEVENTS.TAP, e)
    })
    canvas.addEventListener('mousemove', (e) => {
      if (isTouch) {
        calPoints(viewport, e)
        if (e.which === 1) {
          manager.emit(TXEVENTS.TOUCHMOVE, e)
        }
        else if (e.which === 2) {
          manager.emit(TXEVENTS.RIGHTTOUCHMOVE, e)
        }
        else if (e.which === 3) {
          manager.emit(TXEVENTS.RIGHT_TOUCH_MOVE, e)
        }
      }
    })
    canvas.addEventListener('mouseout', (e) => {
      isTouch = false;
    })
    canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
    })
  }
}

export default attachEvent;