
const isXp = /Windows NT 5\.1.+Chrome\/49/.test(navigator.userAgent)

const lowStandardSize = 1024 * 1024 * 200
const standardSize = 1024 * 1024 * 500

const baseOptions = {
  workerCount: 4,
  turboLimit: 2,
  turbo: false,
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
  constructor(options) {
    this.config = Object.assign({}, baseOptions, options)
    this.cached = { index: {} }
    this.taskQueue = []
    this.workers = []
    this.currentSeriesID = null
  }
  setConfig (options) {
    this.config = Object.assign({}, this.config, options)
  }
  initWorker () {
    let { workerCount, turboLimit } = this.config
    for (let i = 0; i < workerCount; i++) {
      this.workers.push(workerFactory(iturboLimit))
    }
  }
  topTask (imgs) {
    // if (imgs) {
    //   // console.log('调整任务优先级');
    //   let start = [], end = [];
    //   this.priorQueue.forEach(task => {
    //     if (imgs.indexOf(task.imageId) !== -1) {
    //       start.push(task);
    //     } else {
    //       end.push(task);
    //     }
    //   });
    //   this.priorQueue = [...start, ...end];
    // }
  }
  addTask () {

  }
  startTask () {

  }
}

export default DICOMLoader
