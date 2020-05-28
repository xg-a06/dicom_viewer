/* eslint-disable no-fallthrough */
import dicomParser from "dicom-parser";
import processDecodeTask from './decodeImageFrame';
import { getNumberValues } from '../../utils/tools'

const framesAreFragmented = (dataSet) => {
  const numberOfFrames = dataSet.intString('x00280008');
  const pixelDataElement = dataSet.elements.x7fe00010;
  return numberOfFrames !== pixelDataElement.fragments.length;
}

const getEncapsulatedImageFrame = (metaData, dataSet) => {
  const { elements: { x7fe00010: pixelDataElement } } = metaData;
  if (pixelDataElement && pixelDataElement.basicOffsetTable.length) {
    // Basic Offset Table is not empty
    return dicomParser.readEncapsulatedImageFrame(
      dataSet,
      dataSet.elements.x7fe00010,
      0 // 偏移起始 暂时没有写死0
    );
  }
  // Empty basic offset table
  if (framesAreFragmented(dataSet)) {
    const basicOffsetTable = dicomParser.createJPEGBasicOffsetTable(
      dataSet,
      dataSet.elements.x7fe00010
    );

    return dicomParser.readEncapsulatedImageFrame(
      dataSet,
      dataSet.elements.x7fe00010,
      0,// 偏移起始 暂时没有写死0
      basicOffsetTable
    );
  }

  return dicomParser.readEncapsulatedPixelDataFromFragments(
    dataSet,
    dataSet.elements.x7fe00010,
    0 // 偏移起始 暂时没有写死0
  );
}

const isBitSet = (byte, bitPos) => {
  return byte & (1 << bitPos);
}
/**
 * Function to deal with unpacking a binary frame
 */
const unpackBinaryFrame = (byteArray, frameOffset, pixelsPerFrame) => {
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

const getPixelDataSource = (metaData, dataSet) => {
  const pixelDataElement = metaData.elements.x7fe00010;

  if (!pixelDataElement) {
    return null;
  }

  if (pixelDataElement.encapsulatedPixelData) {
    return getEncapsulatedImageFrame(metaData, dataSet);
  }

  return getUncompressedImageFrame(metaData);
}

const createImage = (metaData, pixelDataSource) => {
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
      result = processDecodeTask(metaData, pixelDataSource);
      break;
    default:
      result = new Promise((resolve, reject) => {
        reject(new Error(`No decoder for transfer syntax ${transferSyntax}`));
      });
      break;
  }
  return result;
}

const getDataSet = (arrayBuffer) => {
  const byteArray = new Uint8Array(arrayBuffer);
  return dicomParser.parseDicom(byteArray);
}

const getMetaData = (dataSet) => {
  debugger
  const pixelSpacing = getNumberValues(dataSet, 'x00280030', 2);
  const photometricInterpretation = dataSet.string('x00280004');
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
    // 当Samples Per Pixel字段的值大于1时，Planar Configuration字段规定了实际像素信息的存储方式
    planarConfiguration: dataSet.uint16('x00280006'),
    // 像素弹性变换
    pixelAspectRatio: dataSet.string('x00280034'),
    // 行间距
    rowPixelSpacing: pixelSpacing[0],
    // 列间距
    columnPixelSpacing: pixelSpacing[1],
    // 缩放斜率和截距由硬件制造商决定。
    // 它指定从存储在磁盘表示中的像素到存储在内存表示中的像素的线性转换。磁盘存储的值定义为SV。而转化到内存中的像素值uints就需要两个dicom tag : Rescale intercept和Rescale slope。
    // OutputUnits=m∗SV+b
    // RescaleIntercept:b
    // RescaleSlope:m
    slope: dataSet.floatString('x00281053') || 0,
    intercept: dataSet.floatString('x00281052') || 0,
    // 该字段常见的值有MONOCHROME1、MONOCHROME2、PALETTE COLOR、RGB，其中MONOCHROME1和MONOCHROME2表示单通道灰度图像，只是两者对黑色和白色的映射相反而已；
    // PALETTE COLOR就是BMP中提到的调色板图像，此时需要SamplesPerPixel字段为1,；RGB是常见的R（红）、G（绿）、B（蓝）三通道彩色图像，此时SamplesPerPixel字段值为3，
    // 这就是我们实例中使用的图像。除此以外DICOM3.0标准中还给出了YBR_FULL、HSV、ARGB、CMYK等方式
    photometricInterpretation,
    invert: photometricInterpretation === 'MONOCHROME1',
    minPixelValue: dataSet.uint16('00280106'),
    maxPixelValue: dataSet.uint16('00280107'),
    // 窗位
    windowCenter: getNumberValues(dataSet, 'x00281050', 1),
    // 窗宽
    windowWidth: getNumberValues(dataSet, 'x00281051', 1),
    // instanceNumber
    instanceNumber: dataSet.intString('x00200013'),

  }
  return metaData;
}

function getPixelValues (pixelData) {
  let minPixelValue = Number.MAX_VALUE;
  let maxPixelValue = Number.MIN_VALUE;
  const len = pixelData.length;
  let pixel;

  for (let i = 0; i < len; i++) {
    pixel = pixelData[i];
    minPixelValue = minPixelValue < pixel ? minPixelValue : pixel;
    maxPixelValue = maxPixelValue > pixel ? maxPixelValue : pixel;
  }

  return {
    minPixelValue,
    maxPixelValue
  };
}

const postprocessor = (metaData) => {
  metaData.sizeInBytes = metaData.pixelData.byteLength;
  if (!metaData.minPixelValue || !metaData.maxPixelValue) {
    const pixelValues = getPixelValues(metaData.pixelData);
    metaData.minPixelValue = pixelValues.minPixelValue;
    metaData.maxPixelValue = pixelValues.maxPixelValue;
  }
  // if (metaData.pixelData instanceof Float32Array) {
  //   throw new Error('Float32Array pixel data not handle');
  // } else {
  // metaData.getPixelData = () => metaData.pixelData;
  // }
  delete metaData.elements;

  return metaData;
}

const createImageData = async (arrayBuffer) => {
  const dataSet = getDataSet(arrayBuffer);
  let metaData = getMetaData(dataSet);
  const pixelDataSource = getPixelDataSource(metaData, dataSet);
  // 解码得到pixelData
  metaData = await createImage(metaData, pixelDataSource);
  const image = postprocessor(metaData);
  return image;
}

export default createImageData;