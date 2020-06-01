import EventEmitter from '../../utils/event'
import { TASK_TYPE, LOADER_EVENT } from '../../const'
import LoaderWorker from '../workers/loader.worker';
import { sleep, throttle } from '../../utils/tools';


const isXp = /Windows NT 5\.1.+Chrome\/49/.test(navigator.userAgent)

const lowStandardSize = 1024 * 1024 * 200
const standardSize = 1024 * 1024 * 500
const baseOptions = {
  workerCount: navigator.hardwareConcurrency || 4,
  turboLimit: 2,
  turboState: false,
  sizeLimit: isXp ? lowStandardSize : standardSize
}

const workerFactory = (i, turboLimit, callback) => {
  const loaderWorker = new LoaderWorker();
  loaderWorker.onmessage = (e) => {
    callback && callback(loaderWorker, e);
  }
  Object.assign(loaderWorker, {
    id: Math.floor(Math.random() * 100000 + 100000),
    isTurbo: i >= turboLimit,
    isWork: false
  })
  return loaderWorker;
}

class DICOMLoader extends EventEmitter {
  constructor(options = {}) {
    super();
    this.config = Object.assign({}, baseOptions, options)
    this.cacheManager = { index: {} }
    this.taskQueue = []
    this.workers = []
    this.currentSeriesIds = []
    this.turboState = this.config.turboState
    this.check = throttle(this._check, 1000)
    this.initWorker()
  }
  workerCallback = (worker, e) => {
    let { seriesId, index, image } = e.data;
    if (image) {
      image.getPixelData = () => image.pixelData;
      index = image.instanceNumber - 1;
      this.setCache(seriesId, index, image);
      let count = this.cacheManager[seriesId].filter(i => i).length;
      this.emit(LOADER_EVENT.LOADED, { seriesId, index, image, count })
      worker.isWork = false;
      this.pickTask(worker);
    }
  }
  setConfig (options) {
    this.config = Object.assign({}, this.config, options)
  }
  initWorker () {
    let { workerCount, turboLimit } = this.config
    for (let i = 0; i < workerCount; i++) {
      this.workers.push(workerFactory(i, turboLimit, this.workerCallback))
    }
  }
  alloc (seriesId, len) {
    if (!this.cacheManager[seriesId]) {
      this.cacheManager[seriesId] = new Array(len);
    }
  }
  enableTurboBoost (state) {
    this.turboState = state;
  }
  getCache (imageId) {
    let { cacheManager } = this;
    let cacheResult = null;
    if (cacheManager.index[imageId]) {
      let [seriesId, index] = cacheManager.index[imageId];
      cacheResult = this.cacheManager[seriesId][index];
    }
    return cacheResult;
  }
  setCache (seriesId, index, image) {
    this.cacheManager[seriesId][index] = image;
    this.cacheManager.index[image.imageId] = [seriesId, index];
  }
  setCurrentSeriesIds (...seriesIds) {
    this.currentSeriesIds = seriesIds;
  }
  addCurrentSeriesId (seriesId) {
    if (this.currentSeriesIds.indexOf(seriesId) === -1) {
      this.currentSeriesIds.push(seriesId);
    }
  }
  getCurrentSeriesId () {
    return this.currentSeriesIds;
  }
  topTask (imageUrls = []) {
    let start = []; let end = [];
    this.taskQueue.forEach(task => {
      if (imageUrls.indexOf(task.imageId) !== -1) {
        start.push(task);
      } else {
        end.push(task);
      }
    });
    this.taskQueue = [...start, ...end];
  }
  addPriorTask (seriesId, imageUrls) {
    let tmp = [];
    imageUrls.forEach((url, index) => {
      if (!this.cacheManager.index[url]) {
        tmp.push({
          seriesId,
          index,
          imageId: url
        });
      }
    });
    this.taskQueue = this.taskQueue.filter(p => !(tmp.some(t => t.imageId === p.imageId)));
    Array.prototype.unshift.apply(this.taskQueue, tmp);
  }
  addNormalTask (seriesId, imageUrls) {
    imageUrls.forEach((url, index) => {
      if (!this.cacheManager.index[url]) {
        this.taskQueue.push({
          seriesId,
          index,
          imageId: url
        });
      }
    });
  }
  addTask ({
    type = TASK_TYPE.NORMAL,
    seriesId,
    imageUrls = []
  }) {
    switch (type) {
      case TASK_TYPE.PRIOR:
        this.addPriorTask(seriesId, imageUrls);
        break;
      default:
        this.addNormalTask(seriesId, imageUrls);
        break;
    }
    this.start();
  }
  pickTask (worker) {
    this.check();
    setTimeout(() => {
      let { taskQueue } = this;
      if (taskQueue.length > 0) {
        if (worker.isTurbo && !this.turboState) {
          return;
        }
        let {
          seriesId,
          index,
          imageId,
        } = taskQueue.shift();
        worker.isWork = true;

        worker.postMessage({
          seriesId,
          index,
          imageId,
        });
      }
      // }, Math.ceil(Math.random() * 50 + 50));
    }, Math.ceil(Math.random() * 50));
  }
  async start () {
    for (const worker of this.workers) {
      await sleep(Math.ceil(Math.random() * 100 + 100))
      if (!worker.isWork) {
        this.pickTask(worker);
      }
    }
  }
  recovery (size) {
    let { currentSeriesIds, cacheManager } = this;
    let series = Reflect.ownKeys(cacheManager).filter(key => key !== 'index' && currentSeriesIds.indexOf(key) === -1);
    series.forEach(s => {
      if (cacheManager[s] && cacheManager[s].length > 0) {
        let last = cacheManager[s].pop();
        cacheManager[s] = cacheManager[s].filter(i => i);
        for (let i = 0; i < 20; i++) {
          if (cacheManager[s].length > 2) {
            let img = cacheManager[s].pop();
            delete cacheManager.index[img.imageId];
          }
        }
        if (last) {
          cacheManager[s][cacheManager.index[last.imageId][1]] = last;
        }
      }
    });
    let currentSize = this.getSize();
    if (size !== currentSize && currentSize > this.config.sizeLimit) {
      this.recovery(currentSize);
    }
  }
  getSize () {
    let { cacheManager } = this;
    let series = Reflect.ownKeys(cacheManager).filter(key => key !== 'index');
    let totalSize = 0;
    series.forEach(s => {
      cacheManager[s].forEach(img => {
        totalSize += img.sizeInBytes;
      });
    });
    return totalSize;
  }
  _check () {
    if (this.getSize() > this.config.sizeLimit) {
      console.log('开始回收，缓存大小', this.getSize() / 1024 / 1024);
      this.recovery();
      console.log('回收完毕,缓存大小', this.getSize() / 1024 / 1024);
    }
  }
}

export default DICOMLoader




