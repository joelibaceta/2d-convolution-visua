// Test to validate padding visualization behavior
import { describe, it, expect } from 'vitest';
import { applyPadding, calculatePadding, convolve2D, PaddingType } from './convolution';

describe('Padding Visualization', () => {
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

  it('should properly calculate padding for different modes', () => {
    const paddingTypes: PaddingType[] = ['valid', 'zero', 'reflect', 'same'];
    
    paddingTypes.forEach(paddingType => {
      const paddingValues = calculatePadding(4, 4, 3, 3, 1, 1, paddingType);
      const paddedImage = applyPadding(testImage, paddingValues, paddingType);
      const convolutionResult = convolve2D(testImage, kernel, 1, paddingType);
      
      expect(paddingValues).toBeDefined();
      expect(paddedImage).toBeDefined();
      expect(convolutionResult.steps.length).toBeGreaterThan(0);
      
      // Verify output dimensions match expected formula
      const expectedHeight = Math.floor((4 + paddingValues.top + paddingValues.bottom - 3) / 1) + 1;
      const expectedWidth = Math.floor((4 + paddingValues.left + paddingValues.right - 3) / 1) + 1;
      
      expect(convolutionResult.outputDimensions.height).toBe(Math.max(1, expectedHeight));
      expect(convolutionResult.outputDimensions.width).toBe(Math.max(1, expectedWidth));
    });
  });

  it('should maintain proper kernel positioning', () => {
    const result = convolve2D(testImage, kernel, 1, 'zero');
    
    expect(result.steps.length).toBeGreaterThan(0);
    
    // Check that steps have proper positioning
    result.steps.slice(0, 5).forEach(step => {
      expect(step.position).toBeDefined();
      expect(step.position.row).toBeGreaterThanOrEqual(-result.paddingValues.top);
      expect(step.position.col).toBeGreaterThanOrEqual(-result.paddingValues.left);
      expect(step.inputPatch.length).toBe(kernel.length);
      expect(step.inputPatch[0].length).toBe(kernel[0].length);
    });
  });
});

// Export test functions for development console testing (backward compatibility)
export function testPaddingVisualization() {
  console.log('Padding visualization tests are now handled by vitest');
}

export function validateHighlightingLogic() {
  console.log('Highlighting logic validation is now handled by vitest');
}