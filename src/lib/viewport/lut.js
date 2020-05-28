const generateLinearVOILUT = (windowWidth, windowCenter) => {
  return (modalityLutValue) => {
    return ((modalityLutValue - windowCenter) / windowWidth + 0.5) * 255.0;
  };
}

const generateLinearModalityLUT = (slope, intercept) => {
  return (storedPixelValue) => storedPixelValue * slope + intercept;
}

const getVoiLUTData = (image) => {
  const { minPixelValue, maxPixelValue, windowCenter, windowWidth, slope, intercept } = image;

  let length = maxPixelValue - minPixelValue + 1;

  let mlutfn = generateLinearModalityLUT(slope, intercept);
  let vlutfn = generateLinearVOILUT(windowWidth, windowCenter);

  let voiLUT = new Uint8ClampedArray(length);

  for (let i = 0; i < length; i++) {
    voiLUT[i] = vlutfn(mlutfn(minPixelValue + i));
  }

  return voiLUT;
}

export {
  getVoiLUTData
}