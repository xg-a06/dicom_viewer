import ajax from '../../utils/ajax'
import createImageData from './imageData'
import { TASK_TYPE } from '../../const'
// import LoaderWorker from '../workers/loader.worker';

// const loaderWorker = new LoaderWorker();
const isXp = /Windows NT 5\.1.+Chrome\/49/.test(navigator.userAgent)

const lowStandardSize = 1024 * 1024 * 200
const standardSize = 1024 * 1024 * 500

const baseOptions = {
  workerCount: 6,
  turboLimit: 2,
  turboState: true,
  sizeLimit: isXp ? lowStandardSize : standardSize
}

const workerFactory = (i, turboLimit) => {
  return {
    id: Math.floor(Math.random() * 100000 + 100000),
    isTurbo: i >= turboLimit,
    isWork: false
  }
}

class DICOMLoader {
  constructor(options = {}) {
    this.config = Object.assign({}, baseOptions, options)
    this.cacheManager = { index: {} }
    this.taskQueue = []
    this.workers = []
    this.currentSeriesID = null
    this.turboState = this.config.turboState
    this.initWorker()
  }
  setConfig (options) {
    this.config = Object.assign({}, this.config, options)
  }
  initWorker () {
    let { workerCount, turboLimit } = this.config
    for (let i = 0; i < workerCount; i++) {
      this.workers.push(workerFactory(turboLimit))
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
  async loadImage (imageId) {
    let image = null;
    let { code, data } = await ajax({
      url: imageId,
      responseType: 'arraybuffer'
    });
    if (code === 200) {
      image = await createImageData(data);
    }
    return image;
  }
  retryLoadImage (imageId, retry = 3) {
    return this.loadImage(imageId).then(image => {
      return image;
    }).catch((error) => {
      console.log(error);
      return (retry > 0 ? this.loadImage(imageId, --retry) : false);
    });
  }
  async load (seriesId, index, imageId) {
    try {
      let image = this.getCache(imageId);
      if (!image) {
        image = await this.retryLoadImage(imageId);
        if (image) {
          this.setCache(seriesId, index, image);
        }
      }
      return {
        image,
        index,
        count: this.cacheManager[seriesId].filter(i => i).length
      };
    } catch (error) {
      console.error('加载图片发生异常', index, error);
      return {
        image: null,
        index,
        count: this.cacheManager[seriesId].filter(i => i).length
      };
    }
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
      this.load(seriesId, index, imageId).then(() => {
        setTimeout(() => {
          worker.isWork = false;
          this.pickTask(worker);
        }, Math.ceil(Math.random() * 100 + 100));
      });;
    }
  }
  start () {
    this.workers.forEach(worker => {
      if (!worker.isWork) {
        this.pickTask(worker);
      }
    });
  }
}

export default DICOMLoader




