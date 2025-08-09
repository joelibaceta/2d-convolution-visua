// Comprehensive tests for the corrected padding implementation
import { calculateOutputDimensions, calculatePadding, convolve2D, applyPadding } from './convolution';

// Test function to verify padding calculations and output dimensions
export function testConvolutionDimensions() {
  console.log('Testing convolution output dimensions with new padding system...');

  // Test cases: [inputH, inputW, kernelH, kernelW, strideH, strideW, padding, expectedH, expectedW]
  const testCases = [
    // Valid padding (no padding) cases
    [64, 64, 3, 3, 1, 1, 'valid', 62, 62],  // (64 + 0 - 3)/1 + 1 = 62
    [64, 64, 5, 5, 1, 1, 'valid', 60, 60],  // (64 + 0 - 5)/1 + 1 = 60
    [64, 64, 7, 7, 1, 1, 'valid', 58, 58],  // (64 + 0 - 7)/1 + 1 = 58
    [64, 64, 9, 9, 1, 1, 'valid', 56, 56],  // (64 + 0 - 9)/1 + 1 = 56
    
    // Zero padding cases (pad = kernel_size // 2)
    [64, 64, 3, 3, 1, 1, 'zero', 64, 64],  // (64 + 2*1 - 3)/1 + 1 = 64
    [64, 64, 5, 5, 1, 1, 'zero', 64, 64],  // (64 + 2*2 - 5)/1 + 1 = 64
    [64, 64, 7, 7, 1, 1, 'zero', 64, 64],  // (64 + 2*3 - 7)/1 + 1 = 64
    [64, 64, 9, 9, 1, 1, 'zero', 64, 64],  // (64 + 2*4 - 9)/1 + 1 = 64
    
    // Reflect padding cases (same as zero for symmetric padding)
    [64, 64, 3, 3, 1, 1, 'reflect', 64, 64],
    [64, 64, 5, 5, 1, 1, 'reflect', 64, 64],
    [64, 64, 7, 7, 1, 1, 'reflect', 64, 64],
    [64, 64, 9, 9, 1, 1, 'reflect', 64, 64],
    
    // Same padding cases (maintains input size / stride)
    [64, 64, 3, 3, 1, 1, 'same', 64, 64],  // ceil(64/1) = 64
    [64, 64, 5, 5, 2, 2, 'same', 32, 32],  // ceil(64/2) = 32
    [64, 64, 7, 7, 3, 3, 'same', 22, 22],  // ceil(64/3) = 22
    
    // Stride cases with valid padding
    [64, 64, 3, 3, 2, 2, 'valid', 31, 31],  // (64 + 0 - 3)/2 + 1 = 31
    [64, 64, 5, 5, 2, 2, 'zero', 32, 32],   // (64 + 2*2 - 5)/2 + 1 = 32
    
    // Required unit tests from specification
    [4, 4, 3, 3, 1, 1, 'zero', 4, 4],       // H=4,W=4,k=3×3,s=1,zero pad=1 ⇒ H_out=W_out=4
    [5, 5, 3, 3, 2, 2, 'valid', 2, 2],      // H=5,W=5,k=3×3,s=2,valid ⇒ H_out=W_out=2
  ];

  let allPassed = true;
  
  testCases.forEach(([inputH, inputW, kernelH, kernelW, strideH, strideW, padding, expectedH, expectedW], index) => {
    const paddingValues = calculatePadding(
      inputH as number, inputW as number, 
      kernelH as number, kernelW as number,
      strideH as number, strideW as number,
      padding as any
    );
    
    const result = calculateOutputDimensions(
      inputH as number, inputW as number,
      kernelH as number, kernelW as number,
      strideH as number, strideW as number,
      paddingValues
    );
    
    if (result.height !== expectedH || result.width !== expectedW) {
      console.error(`Test ${index + 1} FAILED: Expected ${expectedH}×${expectedW}, got ${result.height}×${result.width}`);
      console.error(`  Input: ${inputH}×${inputW}, Kernel: ${kernelH}×${kernelW}, Stride: ${strideH}×${strideW}, Padding: ${padding}`);
      console.error(`  Padding values:`, paddingValues);
      allPassed = false;
    } else {
      console.log(`Test ${index + 1} PASSED: ${result.height}×${result.width} (expected ${expectedH}×${expectedW})`);
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
  
  // Create a simple 8×8 test image
  const testImage = Array(8).fill(0).map((_, i) => 
    Array(8).fill(0).map((_, j) => 
      (i + j) % 2 === 0 ? 255 : 0  // Checkerboard pattern
    )
  );
  
  // Test 3×3 identity kernel with different padding modes
  const identityKernel = [
    [0, 0, 0],
    [0, 1, 0], 
    [0, 0, 0]
  ];
  
  const testCases = [
    { padding: 'valid', expectedSize: 6 },   // (8 - 3) + 1 = 6
    { padding: 'zero', expectedSize: 8 },    // (8 + 2*1 - 3) + 1 = 8  
    { padding: 'reflect', expectedSize: 8 }, // (8 + 2*1 - 3) + 1 = 8
    { padding: 'same', expectedSize: 8 }     // ceil(8/1) = 8
  ];
  
  testCases.forEach(({ padding, expectedSize }) => {
    const result = convolve2D(testImage, identityKernel, 1, padding as any);
    
    if (result.outputDimensions.height !== expectedSize || result.outputDimensions.width !== expectedSize) {
      console.error(`Square test FAILED for padding=${padding}: Expected ${expectedSize}×${expectedSize}, got ${result.outputDimensions.height}×${result.outputDimensions.width}`);
    } else {
      console.log(`Square test PASSED for padding=${padding}: ${result.outputDimensions.height}×${result.outputDimensions.width}`);
    }
    
    // Verify output array matches dimensions
    if (result.output.length !== result.outputDimensions.height || 
        result.output[0]?.length !== result.outputDimensions.width) {
      console.error(`Output array size mismatch for padding=${padding}`);
    }
  });
}

// Test reflect padding to ensure no edge pixel duplication
export function testReflectPadding() {
  console.log('Testing reflect padding implementation...');
  
  // Create a simple test image with distinct edge values
  const testImage = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ];
  
  const paddingValues = { top: 1, bottom: 1, left: 1, right: 1 };
  const padded = applyPadding(testImage, paddingValues, 'reflect');
  
  // Expected result (reflect without duplicating edge pixels):
  // 5 4 5 6 5
  // 2 1 2 3 2
  // 5 4 5 6 5
  // 8 7 8 9 8
  // 5 4 5 6 5
  
  const expected = [
    [5, 4, 5, 6, 5],
    [2, 1, 2, 3, 2],
    [5, 4, 5, 6, 5],
    [8, 7, 8, 9, 8],
    [5, 4, 5, 6, 5]
  ];
  
  let reflectTestPassed = true;
  for (let i = 0; i < expected.length; i++) {
    for (let j = 0; j < expected[0].length; j++) {
      if (padded[i][j] !== expected[i][j]) {
        console.error(`Reflect padding test FAILED at [${i},${j}]: expected ${expected[i][j]}, got ${padded[i][j]}`);
        reflectTestPassed = false;
      }
    }
  }
  
  if (reflectTestPassed) {
    console.log('✅ Reflect padding test passed!');
  } else {
    console.error('❌ Reflect padding test failed!');
    console.log('Expected:', expected);
    console.log('Got:', padded);
  }
}

// Test required cases from specification
export function testRequiredCases() {
  console.log('Testing required specification cases...');
  
  // Test case 1: H=4,W=4,k=3×3,s=1,zero pad=1 ⇒ H_out=W_out=4
  const testImage1 = Array(4).fill(0).map(() => Array(4).fill(1));
  const kernel3x3 = Array(3).fill(0).map(() => Array(3).fill(1/9));
  
  const result1 = convolve2D(testImage1, kernel3x3, 1, 'zero');
  if (result1.outputDimensions.height !== 4 || result1.outputDimensions.width !== 4) {
    console.error('Required test 1 FAILED: Expected 4×4 output, got', result1.outputDimensions);
  } else {
    console.log('✅ Required test 1 PASSED: 4×4 → 4×4 with zero padding');
  }
  
  // Test case 2: H=5,W=5,k=3×3,s=2,valid ⇒ H_out=W_out=2
  const testImage2 = Array(5).fill(0).map(() => Array(5).fill(1));
  const result2 = convolve2D(testImage2, kernel3x3, 2, 'valid');
  if (result2.outputDimensions.height !== 2 || result2.outputDimensions.width !== 2) {
    console.error('Required test 2 FAILED: Expected 2×2 output, got', result2.outputDimensions);
  } else {
    console.log('✅ Required test 2 PASSED: 5×5 → 2×2 with stride 2 and valid padding');
  }
}