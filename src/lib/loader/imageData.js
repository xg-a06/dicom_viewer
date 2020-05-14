/* eslint-disable no-fallthrough */
import dicomParser from "dicom-parser";
import processDecodeTask from './decodeImageFrame';


function isBitSet (byte, bitPos) {
  return byte & (1 << bitPos);
}

/**
 * Function to deal with unpacking a binary frame
 */
function unpackBinaryFrame (byteArray, frameOffset, pixelsPerFrame) {
  // Create a new pixel array given the image size
  const pixelData = new Uint8Array(pixelsPerFrame);

  for (let i = 0; i < pixelsPerFrame; i++) {
    // Compute byte position
    const bytePos = Math.floor(i / 8);

    // Get the current byte
    const byte = byteArray[bytePos + frameOffset];

    // Bit position (0-7) within byte
    const bitPos = i % 8;

    // Check whether bit at bitpos is set
    pixelData[i] = isBitSet(byte, bitPos) ? 1 : 0;
  }

  return pixelData;
}

const getEncapsulatedImageFrame = () => {

}

const getUncompressedImageFrame = (metaData) => {
  const { elements: { x7fe00010: pixelDataElement }, rows, columns, samplesPerPixel, bitsAllocated, byteArray } = metaData;

  // 数据偏移
  const pixelDataOffset = pixelDataElement.dataOffset;
  const pixelsPerFrame = rows * columns * samplesPerPixel;

  // 这个是有frameindex偏移计算时候的边界判断 目前没有穿frame需求 暂时没用
  // if (pixelDataOffset >= byteArray.length) {
  //   throw new Error('frame exceeds size of pixelData');
  // }

  if (bitsAllocated === 8) {
    return new Uint8Array(
      byteArray.buffer,
      pixelDataOffset,
      pixelsPerFrame
    );
  } else if (bitsAllocated === 16) {
    return new Uint8Array(
      byteArray.buffer,
      pixelDataOffset,
      pixelsPerFrame * 2
    );
  } else if (bitsAllocated === 1) {
    return unpackBinaryFrame(byteArray, pixelDataOffset, pixelsPerFrame);
  } else if (bitsAllocated === 32) {
    return new Uint8Array(
      byteArray.buffer,
      pixelDataOffset,
      pixelsPerFrame * 4
    );
  }
}

const getPixelData = (metaData) => {
  const pixelDataElement = metaData.elements.x7fe00010;

  if (!pixelDataElement) {
    return null;
  }

  if (pixelDataElement.encapsulatedPixelData) {
    return getEncapsulatedImageFrame(metaData);
  }

  return getUncompressedImageFrame(metaData);
}

const createImage = (metaData, pixelData) => {
  let result = null;
  const { transferSyntax } = metaData;
  switch (transferSyntax) {
    // Implicit VR Little Endian
    case '1.2.840.10008.1.2':
    // Explicit VR Little Endian
    case '1.2.840.10008.1.2.1':
    // Explicit VR Big Endian (retired)
    case '1.2.840.10008.1.2.2':
    // Deflate transfer syntax (deflated by dicomParser)
    case '1.2.840.10008.1.2.1.99':
    // RLE Lossless
    case '1.2.840.10008.1.2.5':
      result = processDecodeTask(metaData, pixelData);
      break;
    default:
      result = new Promise((resolve, reject) => {
        reject(new Error(`No decoder for transfer syntax ${transferSyntax}`));
      });
      break;
  }
  return result;
}

const getMetaData = (arrayBuffer) => {
  const byteArray = new Uint8Array(arrayBuffer);
  const dataSet = dicomParser.parseDicom(byteArray);
  const metaData = {
    byteArray: dataSet.byteArray,
    elements: dataSet.elements,
    // 转换格式
    transferSyntax: dataSet.string('x00020010'),
    // 一个像素取样点存储时分配到的位数，一般RGB的图像，每一个颜色通道都使用8位，所以一般取值为8。对于灰度图像，如果是256级灰阶，一般就是8位。如果高于256级灰阶，一般就采用16位。
    bitsAllocated: dataSet.uint16('x00280100'),
    // 图像的高度
    rows: dataSet.uint16('x00280010'),
    // 图像的宽度
    columns: dataSet.uint16('x00280011'),
    // 每一个像素的取样数，一般来说，CT，MR，DR等灰度图像都是1，而彩超等彩**图像都是3，分别表示R, G, B三个颜色通道。
    samplesPerPixel: dataSet.uint16('x00280002'),
    // 像素数据的表现类型 这是一个枚举值，分别为十六进制数0000和0001.
    pixelRepresentation: dataSet.uint16('x00280103'),
    planarConfiguration: dataSet.uint16('x00280006'),
    pixelAspectRatio: dataSet.string('x00280034'),
  }



  return metaData;
}
const createImageData = async (arrayBuffer) => {
  const metaData = getMetaData(arrayBuffer);
  const pixelData = getPixelData(metaData);

  const image = await createImage(metaData, pixelData);
  return image;
}


export default createImageData;