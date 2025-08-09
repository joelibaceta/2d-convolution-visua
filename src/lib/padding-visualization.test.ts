// Test to validate padding visualization behavior
import { applyPadding, calculatePadding, convolve2D, PaddingType } from './convolution';

export function testPaddingVisualization() {
  console.log('=== Testing Padding Visualization ===');
  
  // Create a small 4x4 test image for easier visualization
  const testImage = [
    [1, 2, 3, 4],
    [5, 6, 7, 8], 
    [9, 10, 11, 12],
    [13, 14, 15, 16]
  ];
  
  const kernel = [
    [0, -1, 0],
    [-1, 4, -1], 
    [0, -1, 0]
  ];
  
  const paddingTypes: PaddingType[] = ['valid', 'zero', 'reflect', 'same'];
  
  paddingTypes.forEach(paddingType => {
    console.log(`\n--- Testing ${paddingType} padding ---`);
    
    const paddingValues = calculatePadding(4, 4, 3, 3, 1, 1, paddingType);
    console.log('Padding values:', paddingValues);
    
    const paddedImage = applyPadding(testImage, paddingValues, paddingType);
    console.log('Original image size:', testImage.length, 'x', testImage[0].length);
    console.log('Padded image size:', paddedImage.length, 'x', paddedImage[0].length);
    
    // Log padded image for verification
    console.log('Padded image:');
    paddedImage.forEach(row => {
      console.log(row.map(val => val.toString().padStart(2, ' ')).join(' '));
    });
    
    const convolutionResult = convolve2D(testImage, kernel, 1, paddingType);
    console.log('Output dimensions:', convolutionResult.outputDimensions);
    console.log('Number of convolution steps:', convolutionResult.steps.length);
    
    // Test the first few steps to see kernel positioning
    const firstStep = convolutionResult.steps[0];
    console.log('First step position:', firstStep.position);
    console.log('First step input patch:');
    firstStep.inputPatch.forEach(row => {
      console.log(row.map(val => val.toString().padStart(2, ' ')).join(' '));
    });
  });
  
  console.log('\n=== Padding visualization test complete ===');
}

export function validateHighlightingLogic() {
  console.log('\n=== Validating Highlighting Logic ===');
  
  // Test case: 4x4 image with 3x3 kernel and zero padding
  const testImage = Array(4).fill(0).map((_, i) => Array(4).fill(i + 1));
  const kernel = Array(3).fill(0).map(() => Array(3).fill(1/9));
  
  const result = convolve2D(testImage, kernel, 1, 'zero');
  
  console.log('Original image size:', testImage.length, 'x', testImage[0].length);
  console.log('Padding values:', result.paddingValues);
  console.log('Output dimensions:', result.outputDimensions);
  
  // Check a few steps to validate positioning
  result.steps.slice(0, 5).forEach((step, i) => {
    console.log(`Step ${i + 1}:`);
    console.log('  Original position (relative to original image):', step.position);
    console.log('  Padded position (relative to padded image):', {
      row: step.position.row + result.paddingValues.top,
      col: step.position.col + result.paddingValues.left
    });
    console.log('  Output position:', { row: step.outputRow, col: step.outputCol });
  });
  
  console.log('\n=== Highlighting logic validation complete ===');
}