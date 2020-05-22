// 类get请求正则匹配
const getReg = /^(GET|DELETE|HEAD)$/i

// 请求的基础配置
const baseOptions = {
  url: '',
  method: 'get',
  baseUrl: '',
  headers: {},
  data: {},
  withCredentials: false,
  responseType: 'json',
  timeout: 10000,
  async: true,
  cache: true,
  auto: true
}
class AJAX {
  constructor(config) {
    let { auto } = config
    this.config = config
    if (auto) {
      return this.request()
    }
  }
  init () {
    let { method, data, cache, url } = this.config
    // 处理请求
    this.config.method = method.toUpperCase()
    // 处理数据
    if (getReg.test(method)) {
      let arr = Object.entries(data).reduce((arr, [k, v]) => {
        arr.push(`${k}=${encodeURIComponent(v)}`)
      }, [])
      let dataStr = arr.join('&')
      if (!cache) {
        dataStr += `${dataStr ? '&' : ''}_=${Math.random()}`
      }
      dataStr = dataStr ? `?${dataStr}` : '';
      this.config.url = url + dataStr
      this.config.data = null
    } else {
      this.config.data = Object.entries(data).reduce((formData, [k, v]) => {
        formData.append(`${k}`, `${encodeURIComponent(v)}`)
        return formData
      }, new FormData())
    }
  }
  open (xhr) {
    let { method, url, async } = this.config
    xhr.open(method, url, async)
  }
  set (xhr, reject) {
    let { headers, responseType, timeout } = this.config
    Object.entries(headers).forEach(([k, v]) => {
      xhr.setRequestHeader(k, v)
    })
    xhr.responseType = responseType
    xhr.timeout = timeout
    // 超时处理
    xhr.ontimeout = function (e) {
      reject(e)
    }
    xhr.onerror = function (e) {
      reject(e)
    }
  }
  send (xhr) {
    let { data } = this.config
    xhr.send(data)
  }
  load (xhr, resolve) {
    xhr.onload = () => {
      resolve({
        code: xhr.status,
        data: xhr.response,
        statusText: xhr.statusText,
        // responseText: xhr.responseText
      })
    }
  }
  request () {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest()
      this.init()
      this.open(xhr)
      this.set(xhr, reject)
      this.send(xhr)
      this.load(xhr, resolve)
    })
  }
}

const ajax = (options) => {
  const config = Object.assign({}, baseOptions, options)
  return new AJAX(config)
}

ajax.create = (options = {}) => {
  const config = Object.assign({}, baseOptions, options, { auto: false })
  return new AJAX(config)
}

export default ajax
