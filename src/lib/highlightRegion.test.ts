// Test for highlight region calculation
import { generateKernel } from './convolution';

// Mock the highlight region calculation logic from App.tsx
function calculateHighlightRegion(
  currentStep: { position: { row: number; col: number } },
  inputImage: number[][],
  kernel: number[][]
) {
  if (!currentStep || !inputImage.length) return undefined;
  
  const kernelHeight = kernel.length;
  const kernelWidth = kernel[0]?.length || 0;
  
  // Don't show highlight if kernel position is completely outside the input bounds
  if (currentStep.position.row >= inputImage.length || 
      currentStep.position.col >= inputImage[0].length ||
      currentStep.position.row + kernelHeight <= 0 ||
      currentStep.position.col + kernelWidth <= 0) {
    return undefined;
  }
  
  const startRow = Math.max(0, currentStep.position.row);
  const startCol = Math.max(0, currentStep.position.col);
  const endRow = Math.min(inputImage.length, currentStep.position.row + kernelHeight);
  const endCol = Math.min(inputImage[0].length, currentStep.position.col + kernelWidth);
  
  // Only create highlight if there's a visible region with valid dimensions
  if (startRow < inputImage.length && startCol < inputImage[0].length && 
      endRow > startRow && endCol > startCol) {
    return {
      startRow,
      startCol,
      height: endRow - startRow,
      width: endCol - startCol
    };
  }
  return undefined;
}

// Test suite
describe('Highlight Region Calculation', () => {
  // Create a 10x10 test image
  const testImage = Array(10).fill(0).map(() => Array(10).fill(128));
  
  test('should create square highlight for square kernels', () => {
    const kernelSizes = [3, 5, 7, 9];
    
    kernelSizes.forEach(size => {
      const kernel = generateKernel('identity', size);
      const step = { position: { row: 2, col: 2 } };
      
      const highlight = calculateHighlightRegion(step, testImage, kernel);
      
      expect(highlight).toBeDefined();
      expect(highlight!.height).toBe(size);
      expect(highlight!.width).toBe(size);
      
      console.log(`Kernel ${size}x${size}: highlight is ${highlight!.height}x${highlight!.width}`);
    });
  });
  
  test('should handle edge cases correctly', () => {
    const kernel = generateKernel('identity', 3);
    
    // Test corner case
    const cornerStep = { position: { row: 8, col: 8 } };
    const cornerHighlight = calculateHighlightRegion(cornerStep, testImage, kernel);
    
    expect(cornerHighlight).toBeDefined();
    expect(cornerHighlight!.height).toBe(2); // Clipped by image boundary
    expect(cornerHighlight!.width).toBe(2);  // Clipped by image boundary
    
    // Test negative position (with padding)
    const negativeStep = { position: { row: -1, col: -1 } };
    const negativeHighlight = calculateHighlightRegion(negativeStep, testImage, kernel);
    
    expect(negativeHighlight).toBeDefined();
    expect(negativeHighlight!.height).toBe(2); // Only bottom 2 rows visible
    expect(negativeHighlight!.width).toBe(2);  // Only right 2 cols visible
  });
  
  test('should return undefined for completely out-of-bounds positions', () => {
    const kernel = generateKernel('identity', 3);
    
    const outOfBoundsStep = { position: { row: 20, col: 20 } };
    const highlight = calculateHighlightRegion(outOfBoundsStep, testImage, kernel);
    
    expect(highlight).toBeUndefined();
  });
});

// Run the test manually since we don't have a proper test runner
console.log('Running highlight region tests...');

// Test 1: Square kernels should produce square highlights
const testImage = Array(10).fill(0).map(() => Array(10).fill(128));
const kernelSizes = [3, 5, 7, 9];

console.log('\nTest 1: Square kernels should produce square highlights');
kernelSizes.forEach(size => {
  const kernel = generateKernel('identity', size);
  const step = { position: { row: 2, col: 2 } };
  
  const highlight = calculateHighlightRegion(step, testImage, kernel);
  
  if (highlight) {
    const isSquare = highlight.height === highlight.width;
    const correctSize = highlight.height === size && highlight.width === size;
    console.log(`✓ Kernel ${size}x${size}: highlight is ${highlight.height}x${highlight.width} - ${isSquare && correctSize ? 'PASS' : 'FAIL'}`);
  } else {
    console.log(`✗ Kernel ${size}x${size}: no highlight generated - FAIL`);
  }
});

console.log('\nHighlight region tests completed.');