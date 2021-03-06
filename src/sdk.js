/* eslint-disable no-unused-vars */

import Viewport from './lib/viewport';
import ViewportManager from './lib/viewportManager';
import { LAYOUT, TOOL_TYPES, TX_EVENTS, SHORTCUT_KEYS } from './const';
// eslint-disable-next-line no-unused-vars
import imageUrls from '../demo/data.json'
import VConsole from 'vconsole'

var vConsole = new VConsole();


let seriesId = '1111111';

// const viewport = new Viewport({
//   seriesId,
//   imageUrls,
//   elm: document.querySelector('#wrapper')
// })
// window.vv = viewport;
// document.body.addEventListener(
//   'touchmove',
//   function (e) {
//     e.preventDefault();
//   },
//   { passive: false }
// );

const viewer = new ViewportManager({
  elm: document.querySelector('#wrapper')
});
viewer.addTask({ seriesId, imageUrls })
viewer.toolsManager.activateTool(TOOL_TYPES.SCALE)
viewer.toolsManager.activateTool(TOOL_TYPES.SCALEBAR)

// viewer.toolsManager.setDefaultActivateTool(TOOL_TYPES.SCALE, { shortcutKey: SHORTCUT_KEYS.MIDDLE_BUTTON })
viewer.toolsManager.setDefaultActivateTool(TOOL_TYPES.MOVE, { shortcutKey: SHORTCUT_KEYS.PIN })
viewer.toolsManager.setDefaultActivateTool(TOOL_TYPES.SCALE, { shortcutKey: SHORTCUT_KEYS.PINCH })
const viewport = viewer.addViewport({ seriesId })

document.querySelector('#change').addEventListener('change', function (e) {
  viewer.changeLayout(e.target.value, viewport.id)
})

document.querySelector('#play').addEventListener('click', function () {
  viewer.viewports.forEach(v => {
    v.autoPlay();
  });
})
document.querySelector('#stop').addEventListener('click', function () {
  viewer.viewports.forEach(v => {
    v.stopPlay();
  });
})
document.body.addEventListener(
  'touchmove',
  function (e) {
    e.preventDefault();
  },
  { passive: false }
);
export default {
  Viewport
}


// 调试源码用
// cornerstoneWADOImageLoader.external.cornerstone = cornerstone
// cornerstoneWADOImageLoader.external.dicomParser = dicomParser
// cornerstoneWADOImageLoader.webWorkerManager.initialize({
//   maxWebWorkers: navigator.hardwareConcurrency || 1,
//   startWebWorkersOnDemand: true,
//   webWorkerPath: '/cornerstoneWADOImageLoaderWebWorker.js',
//   webWorkerTaskPaths: [],
//   taskConfiguration: {
//     decodeTask: {
//       loadCodecsOnStartup: true,
//       initializeCodecsOnStartup: false,
//       codecsPath: '/cornerstoneWADOImageLoaderCodecs.js'
//     }
//   }
// })

// const element = document.getElementById('dicomImage')
// cornerstone.enable(element)
// const viewportOptions = {
//   voi: {
//     windowWidth: 1200,
//     windowCenter: -600
//   }
// }

// cornerstoneWADOImageLoader.wadouri.loadImage('http://localhost:3000/1.2.840.113619.2.416.20795945767143795462432515614159920').promise.then(function (image) {
//   cornerstone.displayImage(element, image, viewportOptions)
// }, function (err) {
//   console.log(err)
// })
