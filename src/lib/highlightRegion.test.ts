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
  
  // According to specification: "The highlighted kernel window is always k×k.
  // Enabling padding must not shrink the highlight."
  // The highlight region should always show the full kernel size
  const region = {
    startRow: currentStep.position.row,
    startCol: currentStep.position.col,
    height: kernelHeight,
    width: kernelWidth
  };
  
  return region;
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
    
    // Test corner case - according to spec, highlight should always be k×k
    const cornerStep = { position: { row: 8, col: 8 } };
    const cornerHighlight = calculateHighlightRegion(cornerStep, testImage, kernel);
    
    expect(cornerHighlight).toBeDefined();
    expect(cornerHighlight!.height).toBe(3); // Always k×k per specification
    expect(cornerHighlight!.width).toBe(3);  // Always k×k per specification
    
    // Test negative position (with padding) - always k×k per spec
    const negativeStep = { position: { row: -1, col: -1 } };
    const negativeHighlight = calculateHighlightRegion(negativeStep, testImage, kernel);
    
    expect(negativeHighlight).toBeDefined();
    expect(negativeHighlight!.height).toBe(3); // Always k×k per specification
    expect(negativeHighlight!.width).toBe(3);  // Always k×k per specification
  });
  
  test('should return highlight for out-of-bounds positions per spec', () => {
    const kernel = generateKernel('identity', 3);
    
    // Test completely out of bounds - per spec: "The highlighted kernel window is always k×k"
    const outOfBoundsStep = { position: { row: 20, col: 20 } };
    const highlight = calculateHighlightRegion(outOfBoundsStep, testImage, kernel);
    
    expect(highlight).toBeDefined();
    expect(highlight!.height).toBe(3);
    expect(highlight!.width).toBe(3);
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