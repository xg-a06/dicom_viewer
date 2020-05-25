import ajax from '../../utils/ajax'
import createImageData from '../loader/imageData'

const loadImage = async (imageId) => {
  let image = null;
  let { code, data } = await ajax({
    url: imageId,
    responseType: 'arraybuffer'
  });
  if (code === 200) {
    image = await createImageData(data);
    image.imageId = imageId;
  }
  return image;
}

const retryLoadImage = (imageId, retry = 3) => {
  return loadImage(imageId).then(image => {
    return image;
  }).catch((error) => {
    console.log(error);
    return (retry > 0 ? loadImage(imageId, --retry) : false);
  });
}

self.addEventListener('message', async (e) => {
  let { seriesId, index, imageId } = e.data;
  let image = await retryLoadImage(imageId);
  self.postMessage({ seriesId, index, image });
}, false);
