export type PaddingType = 'valid' | 'zero' | 'reflect' | 'replicate' | 'same';

export interface PaddingValues {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface ConvolutionStep {
  position: { row: number; col: number };
  inputPatch: number[][];
  kernelValues: number[][];
  elementWiseProducts: number[][];
  sum: number;
  outputRow: number;
  outputCol: number;
}

export interface ConvolutionResult {
  output: number[][];
  steps: ConvolutionStep[];
  outputDimensions: { height: number; width: number };
  paddingValues: PaddingValues;
}

export const KERNEL_PRESETS = {
  identity: {
    name: 'Identity',
    kernel: [[1]]
  },
  box_blur: {
    name: 'Box Blur',
    kernel: [
      [1/9, 1/9, 1/9],
      [1/9, 1/9, 1/9],
      [1/9, 1/9, 1/9]
    ]
  },
  gaussian: {
    name: 'Gaussian',
    kernel: [
      [1/16, 2/16, 1/16],
      [2/16, 4/16, 2/16],
      [1/16, 2/16, 1/16]
    ]
  },
  sharpen: {
    name: 'Sharpen',
    kernel: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ]
  },
  edge_detect: {
    name: 'Edge Detect',
    kernel: [
      [0, -1, 0],
      [-1, 4, -1],
      [0, -1, 0]
    ]
  },
  edge_sobel_x: {
    name: 'Sobel X',
    kernel: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ]
  },
  edge_sobel_y: {
    name: 'Sobel Y',
    kernel: [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ]
  },
  emboss: {
    name: 'Emboss',
    kernel: [
      [-2, -1, 0],
      [-1, 1, 1],
      [0, 1, 2]
    ]
  }
};

/**
 * Calculate padding values based on padding type and parameters
 */
export function calculatePadding(
  inputHeight: number,
  inputWidth: number,
  kernelHeight: number,
  kernelWidth: number,
  strideH: number,
  strideW: number,
  padding: PaddingType
): PaddingValues {
  if (padding === 'valid') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
  
  if (padding === 'same') {
    // "Same" output helper: calculate padding to maintain input size
    const outHeight = Math.ceil(inputHeight / strideH);
    const outWidth = Math.ceil(inputWidth / strideW);
    
    const padTotalH = Math.max((outHeight - 1) * strideH + kernelHeight - inputHeight, 0);
    const padTotalW = Math.max((outWidth - 1) * strideW + kernelWidth - inputWidth, 0);
    
    const padTop = Math.floor(padTotalH / 2);
    const padBottom = padTotalH - padTop;
    const padLeft = Math.floor(padTotalW / 2);
    const padRight = padTotalW - padLeft;
    
    return { top: padTop, bottom: padBottom, left: padLeft, right: padRight };
  }
  
  // For zero, reflect, replicate: use symmetric padding of kernel_size // 2
  const padH = Math.floor(kernelHeight / 2);
  const padW = Math.floor(kernelWidth / 2);
  
  return { top: padH, bottom: padH, left: padW, right: padW };
}

/**
 * Calculate output dimensions using exact mathematical formula
 */
export function calculateOutputDimensions(
  inputHeight: number,
  inputWidth: number,
  kernelHeight: number,
  kernelWidth: number,
  strideH: number,
  strideW: number,
  paddingValues: PaddingValues
): { height: number; width: number } {
  // H_out = floor((H + padT + padB - kH)/sH) + 1
  // W_out = floor((W + padL + padR - kW)/sW) + 1
  const height = Math.floor(
    (inputHeight + paddingValues.top + paddingValues.bottom - kernelHeight) / strideH
  ) + 1;
  
  const width = Math.floor(
    (inputWidth + paddingValues.left + paddingValues.right - kernelWidth) / strideW
  ) + 1;
  
  return { height: Math.max(1, height), width: Math.max(1, width) };
}

/**
 * Apply padding to input image according to padding mode
 */
export function applyPadding(
  input: number[][],
  paddingValues: PaddingValues,
  paddingMode: PaddingType
): number[][] {
  const { top, bottom, left, right } = paddingValues;
  const height = input.length;
  const width = input[0].length;
  
  // If no padding, return original
  if (top === 0 && bottom === 0 && left === 0 && right === 0) {
    return input;
  }
  
  const paddedHeight = height + top + bottom;
  const paddedWidth = width + left + right;
  const padded = Array(paddedHeight).fill(0).map(() => Array(paddedWidth).fill(0));
  
  // Copy original data to center
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      padded[i + top][j + left] = input[i][j];
    }
  }
  
  if (paddingMode === 'zero') {
    // Already initialized with zeros
    return padded;
  }
  
  if (paddingMode === 'reflect') {
    // Reflect mode: mirror around the edge without repeating edge pixel
    // ...3,2,1 | 1,2,3 | 3,2,1...
    
    // Top padding
    for (let i = 0; i < top; i++) {
      for (let j = left; j < left + width; j++) {
        const sourceRow = top + (top - 1 - i);
        if (sourceRow < top + height) {
          padded[i][j] = padded[sourceRow][j];
        }
      }
    }
    
    // Bottom padding
    for (let i = top + height; i < paddedHeight; i++) {
      for (let j = left; j < left + width; j++) {
        const sourceRow = top + height - 1 - (i - (top + height));
        if (sourceRow >= top) {
          padded[i][j] = padded[sourceRow][j];
        }
      }
    }
    
    // Left padding (including corners)
    for (let i = 0; i < paddedHeight; i++) {
      for (let j = 0; j < left; j++) {
        const sourceCol = left + (left - 1 - j);
        if (sourceCol < left + width) {
          padded[i][j] = padded[i][sourceCol];
        }
      }
    }
    
    // Right padding (including corners)
    for (let i = 0; i < paddedHeight; i++) {
      for (let j = left + width; j < paddedWidth; j++) {
        const sourceCol = left + width - 1 - (j - (left + width));
        if (sourceCol >= left) {
          padded[i][j] = padded[i][sourceCol];
        }
      }
    }
    
    return padded;
  }
  
  if (paddingMode === 'replicate') {
    // Replicate mode: extend by repeating edge pixel
    
    // Fill corners first
    // Top-left corner
    for (let i = 0; i < top; i++) {
      for (let j = 0; j < left; j++) {
        padded[i][j] = input[0][0];
      }
    }
    
    // Top-right corner
    for (let i = 0; i < top; i++) {
      for (let j = left + width; j < paddedWidth; j++) {
        padded[i][j] = input[0][width - 1];
      }
    }
    
    // Bottom-left corner
    for (let i = top + height; i < paddedHeight; i++) {
      for (let j = 0; j < left; j++) {
        padded[i][j] = input[height - 1][0];
      }
    }
    
    // Bottom-right corner
    for (let i = top + height; i < paddedHeight; i++) {
      for (let j = left + width; j < paddedWidth; j++) {
        padded[i][j] = input[height - 1][width - 1];
      }
    }
    
    // Top and bottom edges
    for (let i = 0; i < top; i++) {
      for (let j = left; j < left + width; j++) {
        padded[i][j] = input[0][j - left];
      }
    }
    for (let i = top + height; i < paddedHeight; i++) {
      for (let j = left; j < left + width; j++) {
        padded[i][j] = input[height - 1][j - left];
      }
    }
    
    // Left and right edges
    for (let i = top; i < top + height; i++) {
      for (let j = 0; j < left; j++) {
        padded[i][j] = input[i - top][0];
      }
    }
    for (let i = top; i < top + height; i++) {
      for (let j = left + width; j < paddedWidth; j++) {
        padded[i][j] = input[i - top][width - 1];
      }
    }
    
    return padded;
  }
  
  return padded;
}

export function convolve2D(
  input: number[][],
  kernel: number[][],
  stride: number = 1,
  padding: PaddingType = 'valid'
): ConvolutionResult {
  const kernelHeight = kernel.length;
  const kernelWidth = kernel[0].length;
  const inputHeight = input.length;
  const inputWidth = input[0].length;
  
  // Calculate padding values
  const paddingValues = calculatePadding(
    inputHeight, inputWidth, kernelHeight, kernelWidth, stride, stride, padding
  );
  
  // Apply padding to input
  const paddedInput = applyPadding(input, paddingValues, padding);
  
  // Calculate output dimensions using padded input
  const outputDims = calculateOutputDimensions(
    inputHeight, inputWidth, kernelHeight, kernelWidth, stride, stride, paddingValues
  );
  
  const output: number[][] = Array(outputDims.height).fill(0).map(() => Array(outputDims.width).fill(0));
  const steps: ConvolutionStep[] = [];
  
  // Perform convolution
  // Index windows as: top = i * stride, left = j * stride
  // patch = paddedInput[top : top+kernelHeight, left : left+kernelWidth]
  
  for (let i = 0; i < outputDims.height; i++) {
    for (let j = 0; j < outputDims.width; j++) {
      const top = i * stride;
      const left = j * stride;
      
      // Ensure the kernel fits within the padded input
      if (top + kernelHeight <= paddedInput.length && left + kernelWidth <= paddedInput[0].length) {
        // Extract input patch
        const inputPatch: number[][] = [];
        const elementWiseProducts: number[][] = [];
        let sum = 0;
        
        for (let ki = 0; ki < kernelHeight; ki++) {
          inputPatch[ki] = [];
          elementWiseProducts[ki] = [];
          for (let kj = 0; kj < kernelWidth; kj++) {
            const inputVal = paddedInput[top + ki][left + kj];
            const kernelVal = kernel[ki][kj];
            const product = inputVal * kernelVal;
            
            inputPatch[ki][kj] = inputVal;
            elementWiseProducts[ki][kj] = product;
            sum += product;
          }
        }
        
        output[i][j] = sum;
        
        // Calculate position relative to original input (for highlighting)
        const originalRow = top - paddingValues.top;
        const originalCol = left - paddingValues.left;
        
        steps.push({
          position: { row: originalRow, col: originalCol },
          inputPatch,
          kernelValues: kernel.map(row => [...row]),
          elementWiseProducts,
          sum,
          outputRow: i,
          outputCol: j
        });
      }
    }
  }
  
  return { output, steps, outputDimensions: outputDims, paddingValues };
}

export function resizeTo64(imageData: ImageData): number[][] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = 64;
  canvas.height = 64;
  
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  
  tempCtx.putImageData(imageData, 0, 0);
  
  // Use nearest neighbor scaling for crisp pixels
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempCanvas, 0, 0, 64, 64);
  
  const resizedData = ctx.getImageData(0, 0, 64, 64);
  return toGrayscale(resizedData);
}

export function toGrayscale(imageData: ImageData): number[][] {
  const { data, width, height } = imageData;
  const grayscale: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));
  
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const pixelIndex = (i * width + j) * 4;
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];
      
      // Standard grayscale conversion
      grayscale[i][j] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
  }
  
  return grayscale;
}

export function normalizeOutput(output: number[][]): number[][] {
  const flat = output.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const range = max - min;
  
  if (range === 0) return output;
  
  return output.map(row => 
    row.map(val => Math.round(((val - min) / range) * 255))
  );
}

export function clampOutput(output: number[][]): number[][] {
  return output.map(row => 
    row.map(val => Math.max(0, Math.min(255, Math.round(val))))
  );
}

export function generateKernel(preset: keyof typeof KERNEL_PRESETS, size?: number): number[][] {
  const baseKernel = KERNEL_PRESETS[preset].kernel.map(row => [...row]);
  
  // If no size specified or size matches the preset, return the base kernel
  if (!size || size === baseKernel.length) {
    return baseKernel;
  }
  
  // For identity kernel, generate any size
  if (preset === 'identity') {
    const kernel = Array(size).fill(0).map(() => Array(size).fill(0));
    const center = Math.floor(size / 2);
    kernel[center][center] = 1;
    return kernel;
  }
  
  // For box blur, generate any size
  if (preset === 'box_blur') {
    const value = 1 / (size * size);
    return Array(size).fill(0).map(() => Array(size).fill(value));
  }
  
  // For edge detection, generate any size 
  if (preset === 'edge_detect') {
    const kernel = Array(size).fill(0).map(() => Array(size).fill(0));
    const center = Math.floor(size / 2);
    
    if (size <= 3) {
      // For small kernels, use the classic pattern
      kernel[center][center] = size * size - 1;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (i !== center || j !== center) {
            kernel[i][j] = -1;
          }
        }
      }
    } else {
      // For larger kernels, use a Laplacian-like pattern with distance-based weights
      const totalNegative = size * size - 1;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (i === center && j === center) {
            kernel[i][j] = totalNegative;
          } else {
            const distance = Math.max(Math.abs(i - center), Math.abs(j - center));
            // Weight by inverse distance - closer neighbors get more negative weight
            kernel[i][j] = -1 / distance;
          }
        }
      }
      
      // Normalize so the negative weights sum to -totalNegative
      const negativeSum = kernel.flat().filter(v => v < 0).reduce((sum, v) => sum + v, 0);
      const scale = -totalNegative / negativeSum;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (kernel[i][j] < 0) {
            kernel[i][j] *= scale;
          }
        }
      }
    }
    return kernel;
  }
  
  // For sharpen kernel, generate any size
  if (preset === 'sharpen') {
    const kernel = Array(size).fill(0).map(() => Array(size).fill(0));
    const center = Math.floor(size / 2);
    
    if (size <= 3) {
      // For small kernels, use the classic pattern
      kernel[center][center] = size * size;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (i !== center || j !== center) {
            kernel[i][j] = -1;
          }
        }
      }
    } else {
      // For larger kernels, use a more refined sharpen pattern
      // Center gets strong positive weight, immediate neighbors get negative weight
      const centerWeight = size * 2;
      kernel[center][center] = centerWeight;
      
      // Apply negative weights with distance-based falloff
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (i !== center || j !== center) {
            const distance = Math.max(Math.abs(i - center), Math.abs(j - center));
            if (distance <= 2) { // Only apply negative weights to close neighbors
              kernel[i][j] = -1 / distance;
            }
          }
        }
      }
      
      // Ensure the kernel sums to 1 for proper sharpening
      const sum = kernel.flat().reduce((a, b) => a + b, 0);
      if (sum !== 1) {
        kernel[center][center] += (1 - sum);
      }
    }
    return kernel;
  }
  
  // For Gaussian blur, generate approximation for different sizes
  if (preset === 'gaussian') {
    if (size === 1) {
      return [[1]];
    }
    if (size === 5) {
      return [
        [1/273, 4/273, 7/273, 4/273, 1/273],
        [4/273, 16/273, 26/273, 16/273, 4/273],
        [7/273, 26/273, 41/273, 26/273, 7/273],
        [4/273, 16/273, 26/273, 16/273, 4/273],
        [1/273, 4/273, 7/273, 4/273, 1/273]
      ];
    }
    if (size === 7) {
      // 7x7 Gaussian approximation
      const kernel = [
        [0, 0, 1, 2, 1, 0, 0],
        [0, 3, 13, 22, 13, 3, 0],
        [1, 13, 59, 97, 59, 13, 1],
        [2, 22, 97, 159, 97, 22, 2],
        [1, 13, 59, 97, 59, 13, 1],
        [0, 3, 13, 22, 13, 3, 0],
        [0, 0, 1, 2, 1, 0, 0]
      ];
      const sum = kernel.flat().reduce((a, b) => a + b, 0);
      return kernel.map(row => row.map(val => val / sum));
    }
    if (size === 9) {
      // 9x9 Gaussian approximation
      const kernel = [
        [0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 1, 3, 6, 7, 6, 3, 1, 0],
        [0, 3, 12, 26, 33, 26, 12, 3, 0],
        [1, 6, 26, 55, 71, 55, 26, 6, 1],
        [1, 7, 33, 71, 91, 71, 33, 7, 1],
        [1, 6, 26, 55, 71, 55, 26, 6, 1],
        [0, 3, 12, 26, 33, 26, 12, 3, 0],
        [0, 1, 3, 6, 7, 6, 3, 1, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0]
      ];
      const sum = kernel.flat().reduce((a, b) => a + b, 0);
      return kernel.map(row => row.map(val => val / sum));
    }
    // For other sizes, generate a proper Gaussian approximation using distance from center
    const center = Math.floor(size / 2);
    const sigma = size / 6; // Adjust sigma based on kernel size
    const kernel = Array(size).fill(0).map((_, i) => 
      Array(size).fill(0).map((_, j) => {
        const distance = Math.sqrt((i - center) ** 2 + (j - center) ** 2);
        return Math.exp(-(distance ** 2) / (2 * sigma ** 2));
      })
    );
    
    // Normalize the kernel
    const sum = kernel.flat().reduce((a, b) => a + b, 0);
    return kernel.map(row => row.map(val => val / sum));
  }
  
  // For Sobel kernels, only work with 3x3. For other sizes, switch to edge detection
  if (preset === 'edge_sobel_x' || preset === 'edge_sobel_y') {
    if (size === 3) {
      return baseKernel;
    }
    // For non-3x3, provide a directional edge detection alternative
    const kernel = Array(size).fill(0).map(() => Array(size).fill(0));
    const center = Math.floor(size / 2);
    
    if (preset === 'edge_sobel_x') {
      // Horizontal edge detection
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < center; j++) {
          kernel[i][j] = -1;
        }
        for (let j = center + 1; j < size; j++) {
          kernel[i][j] = 1;
        }
      }
    } else {
      // Vertical edge detection
      for (let j = 0; j < size; j++) {
        for (let i = 0; i < center; i++) {
          kernel[i][j] = -1;
        }
        for (let i = center + 1; i < size; i++) {
          kernel[i][j] = 1;
        }
      }
    }
    return kernel;
  }
  
  // For emboss kernel, only work with 3x3. For other sizes, switch to a general emboss pattern
  if (preset === 'emboss') {
    if (size === 3) {
      return baseKernel;
    }
    // For non-3x3, create a diagonal emboss pattern
    const kernel = Array(size).fill(0).map(() => Array(size).fill(0));
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (i < j) {
          kernel[i][j] = -1;
        } else if (i > j) {
          kernel[i][j] = 1;
        }
        // Diagonal stays 0 for neutral
      }
    }
    return kernel;
  }
  
  // Fallback: if we don't have scaling logic for this preset, return the original
  return baseKernel;
}