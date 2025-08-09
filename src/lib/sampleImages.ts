// Sample image generators for testing convolution without file upload
export function generateCheckerboard(size: number = 64): number[][] {
  const grid: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // Create 8x8 checkerboard pattern
      const blockSize = 8;
      const blockRow = Math.floor(i / blockSize);
      const blockCol = Math.floor(j / blockSize);
      grid[i][j] = (blockRow + blockCol) % 2 === 0 ? 255 : 0;
    }
  }
  
  return grid;
}

export function generateGradient(size: number = 64): number[][] {
  const grid: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // Horizontal gradient from left (dark) to right (light)
      grid[i][j] = Math.round((j / (size - 1)) * 255);
    }
  }
  
  return grid;
}

export function generateCircle(size: number = 64): number[][] {
  const grid: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  const center = size / 2;
  const radius = size * 0.3;
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const distance = Math.sqrt((i - center) ** 2 + (j - center) ** 2);
      grid[i][j] = distance <= radius ? 255 : 0;
    }
  }
  
  return grid;
}

export function generateNoise(size: number = 64): number[][] {
  const grid: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      grid[i][j] = Math.round(Math.random() * 255);
    }
  }
  
  return grid;
}

export const SAMPLE_IMAGES = {
  checkerboard: { name: 'Checkerboard', generator: generateCheckerboard },
  gradient: { name: 'Horizontal Gradient', generator: generateGradient },
  circle: { name: 'White Circle', generator: generateCircle },
  noise: { name: 'Random Noise', generator: generateNoise }
};