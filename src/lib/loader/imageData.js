import dicomParser from "dicom-parser";


const getEncapsulatedImageFrame = () => {

}

const getUncompressedImageFrame = (dataSet) => {
  const pixelDataElement = dataSet.elements.x7fe00010;
  const bitsAllocated = dataSet.uint16('x00280100');
  const rows = dataSet.uint16('x00280010');
  const columns = dataSet.uint16('x00280011');
  // Samples per Pixel 
  // 每一个像素的取样数，一般来说，CT，MR，DR等灰度图像都是1，而彩超等彩**图像都是3，分别表示R, G, B三个颜色通道。
  const samplesPerPixel = dataSet.uint16('x00280002');

  const pixelDataOffset = pixelDataElement.dataOffset;
  const pixelsPerFrame = rows * columns * samplesPerPixel;
}


function createImageData (arrayBuffer) {
  return {

  }
}


export default createImageData;