// Simple test to verify convolution boundaries
const { calculateOutputDimensions } = require('./src/lib/convolution.ts');

// Test cases to verify the fix
console.log("Testing output dimensions with various stride + padding combinations:");

// 64x64 input with 3x3 kernel
console.log("64x64 input, 3x3 kernel:");
console.log("- stride=1, no padding:", calculateOutputDimensions(64, 64, 3, 1, 'none')); // Should be 62x62
console.log("- stride=2, no padding:", calculateOutputDimensions(64, 64, 3, 2, 'none')); // Should be 31x31
console.log("- stride=1, zero padding:", calculateOutputDimensions(64, 64, 3, 1, 'zero')); // Should be 64x64
console.log("- stride=2, zero padding:", calculateOutputDimensions(64, 64, 3, 2, 'zero')); // Should be 32x32

// 64x64 input with 5x5 kernel  
console.log("\n64x64 input, 5x5 kernel:");
console.log("- stride=1, no padding:", calculateOutputDimensions(64, 64, 5, 1, 'none')); // Should be 60x60
console.log("- stride=2, no padding:", calculateOutputDimensions(64, 64, 5, 2, 'none')); // Should be 30x30
console.log("- stride=1, zero padding:", calculateOutputDimensions(64, 64, 5, 1, 'zero')); // Should be 64x64
console.log("- stride=2, zero padding:", calculateOutputDimensions(64, 64, 5, 2, 'zero')); // Should be 32x32

console.log("\nFormula: floor((input + 2*padding - kernel) / stride) + 1");