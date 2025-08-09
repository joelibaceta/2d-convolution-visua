// Simple test to verify convolution output dimensions
import { calculateOutputDimensions, convolve2D } from './convolution';

// Test function to verify output dimensions
export function testConvolutionDimensions() {
  console.log('Testing convolution output dimensions...');

  // Test cases: [inputSize, kernelSize, stride, padding, expected output size]
  const testCases = [
    // No padding cases
    [64, 3, 1, 'none', 62],  // (64 - 3) / 1 + 1 = 62
    [64, 5, 1, 'none', 60],  // (64 - 5) / 1 + 1 = 60
    [64, 7, 1, 'none', 58],  // (64 - 7) / 1 + 1 = 58
    [64, 9, 1, 'none', 56],  // (64 - 9) / 1 + 1 = 56
    
    // Zero padding cases (same padding = kernel_size / 2)
    [64, 3, 1, 'zero', 64],  // (64 + 2*1 - 3) / 1 + 1 = 64
    [64, 5, 1, 'zero', 64],  // (64 + 2*2 - 5) / 1 + 1 = 64
    [64, 7, 1, 'zero', 64],  // (64 + 2*3 - 7) / 1 + 1 = 64
    [64, 9, 1, 'zero', 64],  // (64 + 2*4 - 9) / 1 + 1 = 64
    
    // Reflect padding cases
    [64, 3, 1, 'reflect', 64],
    [64, 5, 1, 'reflect', 64],
    [64, 7, 1, 'reflect', 64],
    [64, 9, 1, 'reflect', 64],
    
    // Stride cases
    [64, 3, 2, 'none', 31],  // (64 - 3) / 2 + 1 = 31
    [64, 5, 2, 'zero', 32],  // (64 + 2*2 - 5) / 2 + 1 = 32
  ];

  let allPassed = true;
  
  testCases.forEach(([inputSize, kernelSize, stride, padding, expected], index) => {
    const result = calculateOutputDimensions(
      inputSize as number, 
      inputSize as number, 
      kernelSize as number, 
      stride as number, 
      padding as any
    );
    
    if (result.height !== expected || result.width !== expected) {
      console.error(`Test ${index + 1} FAILED: Expected ${expected}x${expected}, got ${result.height}x${result.width}`);
      console.error(`  Input: ${inputSize}x${inputSize}, Kernel: ${kernelSize}x${kernelSize}, Stride: ${stride}, Padding: ${padding}`);
      allPassed = false;
    } else {
      console.log(`Test ${index + 1} PASSED: ${result.height}x${result.width} (expected ${expected}x${expected})`);
    }
  });

  if (allPassed) {
    console.log('✅ All dimension tests passed!');
  } else {
    console.error('❌ Some dimension tests failed!');
  }
}

// Test actual convolution to ensure square outputs for square inputs
export function testSquareConvolution() {
  console.log('Testing square convolution results...');
  
  // Create a simple 8x8 test image
  const testImage = Array(8).fill(0).map((_, i) => 
    Array(8).fill(0).map((_, j) => 
      (i + j) % 2 === 0 ? 255 : 0  // Checkerboard pattern
    )
  );
  
  // Test 3x3 identity kernel with different padding modes
  const identityKernel = [
    [0, 0, 0],
    [0, 1, 0], 
    [0, 0, 0]
  ];
  
  const testCases = [
    { padding: 'none', expectedSize: 6 },   // (8 - 3) + 1 = 6
    { padding: 'zero', expectedSize: 8 },   // (8 + 2*1 - 3) + 1 = 8  
    { padding: 'reflect', expectedSize: 8 } // (8 + 2*1 - 3) + 1 = 8
  ];
  
  testCases.forEach(({ padding, expectedSize }) => {
    const result = convolve2D(testImage, identityKernel, 1, padding as any);
    
    if (result.outputDimensions.height !== expectedSize || result.outputDimensions.width !== expectedSize) {
      console.error(`Square test FAILED for padding=${padding}: Expected ${expectedSize}x${expectedSize}, got ${result.outputDimensions.height}x${result.outputDimensions.width}`);
    } else {
      console.log(`Square test PASSED for padding=${padding}: ${result.outputDimensions.height}x${result.outputDimensions.width}`);
    }
    
    // Verify output array matches dimensions
    if (result.output.length !== result.outputDimensions.height || 
        result.output[0]?.length !== result.outputDimensions.width) {
      console.error(`Output array size mismatch for padding=${padding}`);
    }
  });
}