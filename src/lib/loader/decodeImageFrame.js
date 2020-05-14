import decodeLittleEndian from '../decoders/decodeLittleEndian';
import decodeBigEndian from '../decoders/decodeBigEndian';
import decodeRLE from '../decoders/decodeRLE';

const processDecodeTask = (metaData, pixelData) => {
  const { transferSyntax } = metaData;
  switch (transferSyntax) {
    case '1.2.840.10008.1.2':
    case '1.2.840.10008.1.2.1':
    case '1.2.840.10008.1.2.1.99':
      metaData = decodeLittleEndian(metaData, pixelData);
      break;
    case '1.2.840.10008.1.2.2':
      metaData = decodeBigEndian(metaData, pixelData);
      break;
    case '1.2.840.10008.1.2.5':
      metaData = decodeRLE(metaData, pixelData);
      break;
    default:
      break;

  }
  return metaData;
}

export default processDecodeTask;