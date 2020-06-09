/* eslint-disable no-unused-vars */
import { TXEVENTS } from '../../const'
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
      e.eventName = TXEVENTS.TOUCHDOWN;
      manager.emit(TXEVENTS.TOUCHDOWN, e)
    });

    canvas.addEventListener('touchend', (e) => {
      const touches = e.changedTouches[0];
      endX = touches.clientX;
      endY = touches.clientY;
      e.clientX = endX;
      e.clientY = endY;
      calPoints(viewport, e)
      e.eventName = TXEVENTS.TOUCHUP;
      manager.emit(TXEVENTS.TOUCHUP, e)
      if (Math.abs(startX - endX) < 10 && Math.abs(startY - endY) < 10) {
        e.eventName = TXEVENTS.TAP;
        manager.emit(TXEVENTS.TAP, e)
      }
    });
    canvas.addEventListener('touchmove', throttle((e) => {
      const touches = e.changedTouches[0];
      e.clientX = touches.clientX;
      e.clientY = touches.clientY;
      calPoints(viewport, e)
      e.eventName = TXEVENTS.TOUCHMOVE;
      manager.emit(TXEVENTS.TOUCHMOVE, e)
    }, 50))

  } else {
    canvas.addEventListener('click', (e) => {
      e.eventName = TXEVENTS.TAP;
      manager.emit(TXEVENTS.TAP, e)
    })
    canvas.addEventListener('mousemove', (e) => {
      calPoints(viewport, e)
      e.eventName = TXEVENTS.TOUCHMOVE;
      manager.emit(TXEVENTS.TOUCHMOVE, e)
    })
  }
}

export default attachEvent;