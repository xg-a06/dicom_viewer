import { sum, minus } from './module'
import ajax from './utils/ajax'

ajax({
  url: 'http://localhost:3333/1.2.840.113619.2.416.20795945767143795462432515614159920',
  responseType: 'arraybuffer'
}).then(({ code, data }) => {
  if (code === 200) {
    const response = new Uint8Array(data);
    console.log(response);
  }
})
export default {
  sum,
  minus
}
