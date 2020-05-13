import dicomParser from "dicom-parser";


const getEncapsulatedImageFrame = () => {

}

const getUncompressedImageFrame = (dataSet) => {
  const pixelDataElement =
    dataSet.elements.x7fe00010 || dataSet.elements.x7fe00008;
  const bitsAllocated = dataSet.uint16('x00280100');
  const rows = dataSet.uint16('x00280010');
  const columns = dataSet.uint16('x00280011');
  const samplesPerPixel = dataSet.uint16('x00280002');

  const pixelDataOffset = pixelDataElement.dataOffset;
  const pixelsPerFrame = rows * columns * samplesPerPixel;
}


function createImageData (arrayBuffer) {
  return {

  }
}


export default createImageData;