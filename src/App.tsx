import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Edit } from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';
import { PixelGrid } from '@/components/PixelGrid';
import { PaddedPixelGrid } from '@/components/PaddedPixelGrid';
import { KernelInspector } from '@/components/KernelInspector';
import { AnimationControls } from '@/components/AnimationControls';
import { generateCheckerboard } from '@/lib/sampleImages';
import { 
  resizeTo64, 
  convolve2D, 
  generateKernel, 
  normalizeOutput as normalizeOutputValues, 
  clampOutput,
  applyPadding,
  KERNEL_PRESETS,
  PaddingType,
  ConvolutionResult,
  ConvolutionStep 
} from '@/lib/convolution';
import { testConvolutionDimensions, testSquareConvolution, testReflectPadding, testRequiredCases } from '@/lib/convolution.test';
import { testPaddingVisualization, validateHighlightingLogic } from '@/lib/padding-visualization.test';

function App() {
  // Run tests in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Manual tests
      console.log('=== Testing new padding system ===');
      
      // Test case 1: 4x4 input, 3x3 kernel, stride 1, zero padding should give 4x4 output
      const testInput = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12], 
        [13, 14, 15, 16]
      ];
      
      const identityKernel = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ];
      
      const result1 = convolve2D(testInput, identityKernel, 1, 'zero');
      console.log('Test 1 - Zero padding:', result1.outputDimensions, 'should be 4x4');
      
      // Test case 2: 5x5 input, 3x3 kernel, stride 2, valid padding should give 2x2 output  
      const testInput2 = Array(5).fill(0).map(() => Array(5).fill(1));
      const result2 = convolve2D(testInput2, identityKernel, 2, 'valid');
      console.log('Test 2 - Valid padding stride 2:', result2.outputDimensions, 'should be 2x2');
      
      // Test case 3: Same padding should maintain input size divided by stride
      const result3 = convolve2D(testInput, identityKernel, 1, 'same'); 
      console.log('Test 3 - Same padding:', result3.outputDimensions, 'should be 4x4');
      
      testConvolutionDimensions();
      testSquareConvolution();
      testReflectPadding();
      testRequiredCases();
      
      // Test our new padding visualization system
      testPaddingVisualization();
      validateHighlightingLogic();
    }
  }, []);
  // Initialize with a default sample image
  const [inputImage, setInputImage] = useState<number[][]>(generateCheckerboard());
  const [convolutionResult, setConvolutionResult] = useState<ConvolutionResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Convolution parameters
  const [kernelSize, setKernelSize] = useState(3);
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState<PaddingType>('valid');
  const [kernelPreset, setKernelPreset] = useState<keyof typeof KERNEL_PRESETS | 'custom'>('sharpen');
  const [customKernel, setCustomKernel] = useState<number[][]>(() => {
    // Initialize with a 3x3 edge detection kernel as a more interesting default
    return [
      [0, -1, 0],
      [-1, 4, -1], 
      [0, -1, 0]
    ];
  });
  
  // Display options  
  const [showInputValues, setShowInputValues] = useState<boolean>(false);
  const [showKernelValues, setShowKernelValues] = useState<boolean>(true);
  const [showOutputValues, setShowOutputValues] = useState<boolean>(false);
  const [normalizeOutput, setNormalizeOutput] = useState<boolean>(false);
  
  // Current kernel - memoized to prevent infinite re-renders
  const currentKernel = useMemo(() => {
    if (kernelPreset === 'custom') {
      return customKernel;
    }
    return generateKernel(kernelPreset, kernelSize);
  }, [kernelPreset, customKernel, kernelSize]);
  
  // Current step data
  const currentStep = convolutionResult?.steps[currentStepIndex];
  
  // Recompute convolution when parameters change
  useEffect(() => {
    if (!inputImage || inputImage.length === 0) {
      setConvolutionResult(null);
      setCurrentStepIndex(0);
      return;
    }
    
    const result = convolve2D(inputImage, currentKernel, stride, padding);
    setConvolutionResult(result);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [inputImage, currentKernel, stride, padding]);
  
  // Handle animation
  useEffect(() => {
    if (!isPlaying || !convolutionResult) return;
    
    animationRef.current = setTimeout(() => {
      setCurrentStepIndex(prev => {
        if (prev >= convolutionResult.steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, animationSpeed);
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, convolutionResult, animationSpeed]);
  
  const handleImageLoad = useCallback((imageData: ImageData) => {
    const resized = resizeTo64(imageData);
    setInputImage(resized);
  }, [setInputImage]);
  
  const handlePlayPause = useCallback(() => {
    if (!convolutionResult) return;
    
    if (currentStepIndex >= convolutionResult.steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentStepIndex, convolutionResult]);
  
  const handleStep = useCallback(() => {
    if (!convolutionResult || isPlaying) return;
    
    setCurrentStepIndex(prev => 
      Math.min(prev + 1, convolutionResult.steps.length - 1)
    );
  }, [convolutionResult, isPlaying]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'KeyN') {
        e.preventDefault();
        handleStep();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePlayPause, handleStep]);
  
  const handleReset = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);
  
  const handleKernelPresetChange = useCallback((preset: keyof typeof KERNEL_PRESETS | 'custom') => {
    setKernelPreset(preset);
    // When switching to custom, initialize with current kernel
    if (preset === 'custom') {
      setCustomKernel(currentKernel.map(row => [...row]));
    }
  }, [currentKernel]);
  
  const handleCustomKernelChange = useCallback((newKernel: number[][]) => {
    setCustomKernel(newKernel);
  }, []);
  
  const handleKernelSizeChange = useCallback((size: number) => {
    setKernelSize(size);
    
    // All presets now support scaling, so we don't need to switch presets automatically
    // The generateKernel function will handle creating appropriate kernels for each size
    
    // When kernel size changes and we're using custom, generate a new kernel of that size
    if (kernelPreset === 'custom') {
      if (size === 3) {
        // Use edge detection kernel for 3x3
        setCustomKernel([
          [0, -1, 0],
          [-1, 4, -1],
          [0, -1, 0]
        ]);
      } else {
        // For other sizes, create identity kernel
        const newKernel = Array(size).fill(0).map(() => Array(size).fill(0));
        const center = Math.floor(size / 2);
        newKernel[center][center] = 1;
        setCustomKernel(newKernel);
      }
    }
  }, [kernelPreset]);
  
  // Process output for display
  const displayOutput = convolutionResult ? (() => {
    const stepsCompleted = currentStepIndex + 1;
    const partialOutput: number[][] = Array(convolutionResult.outputDimensions.height)
      .fill(0)
      .map(() => Array(convolutionResult.outputDimensions.width).fill(NaN));
    
    // Fill completed steps
    for (let i = 0; i < stepsCompleted && i < convolutionResult.steps.length; i++) {
      const step = convolutionResult.steps[i];
      partialOutput[step.outputRow][step.outputCol] = step.sum;
    }
    
    // Apply normalization/clamping only to completed values
    const processed = normalizeOutput ? 
      normalizeOutputValues(convolutionResult.output) : 
      clampOutput(convolutionResult.output);
      
    // Merge processed values with partial output
    for (let i = 0; i < stepsCompleted && i < convolutionResult.steps.length; i++) {
      const step = convolutionResult.steps[i];
      partialOutput[step.outputRow][step.outputCol] = processed[step.outputRow][step.outputCol];
    }
    
    return partialOutput.map(row => 
      row.map(val => isNaN(val) ? 128 : val) // Gray for incomplete
    );
  })() : [];
  
  const highlightRegion = currentStep && inputImage.length > 0 && convolutionResult ? (() => {
    const kernelHeight = currentKernel.length;
    const kernelWidth = currentKernel[0]?.length || 0;
    
    // The currentStep.position is relative to the original input, but we need coordinates
    // relative to the padded input for proper highlighting
    const { paddingValues } = convolutionResult;
    
    // Convert from original coordinates to padded coordinates
    const paddedRow = currentStep.position.row + paddingValues.top;
    const paddedCol = currentStep.position.col + paddingValues.left;
    
    // The highlight region should always show the full kernel size
    // No clamping - show the full kernel area even if it extends beyond original boundaries
    const region = {
      startRow: paddedRow,
      startCol: paddedCol,
      height: kernelHeight,
      width: kernelWidth
    };
    
    return region;
  })() : undefined;
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">2D Convolution Visualizer</h1>
          <p className="text-muted-foreground">
            Watch how convolution kernels transform images step by step. 
            Try different presets, adjust parameters, or create custom kernels.
            <br />
            <span className="text-accent font-medium">Click sample images below or upload your own to get started!</span>
          </p>
        </div>
        
        {/* Controls */}
        <AnimationControls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onStep={handleStep}
          onReset={handleReset}
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={setAnimationSpeed}
          kernelSize={kernelSize}
          onKernelSizeChange={handleKernelSizeChange}
          stride={stride}
          onStrideChange={setStride}
          padding={padding}
          onPaddingChange={setPadding}
          kernelPreset={kernelPreset}
          onKernelPresetChange={handleKernelPresetChange}
          showInputValues={showInputValues}
          onShowInputValuesChange={setShowInputValues}
          showKernelValues={showKernelValues}
          onShowKernelValuesChange={setShowKernelValues}
          showOutputValues={showOutputValues}
          onShowOutputValuesChange={setShowOutputValues}
          normalizeOutput={normalizeOutput}
          onNormalizeOutputChange={setNormalizeOutput}
          currentStep={currentStepIndex + 1}
          totalSteps={convolutionResult?.steps.length || 0}
        />
        
        {/* Main visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Image */}
          {convolutionResult ? (
            <PaddedPixelGrid
              originalData={inputImage}
              paddedData={applyPadding(inputImage, convolutionResult.paddingValues, padding)}
              paddingValues={convolutionResult.paddingValues}
              title="Input Image"
              highlightRegion={highlightRegion}
              showValues={showInputValues}
              cellSize={6}
            />
          ) : (
            <PixelGrid
              data={inputImage}
              title="Input Image"
              showValues={showInputValues}
              cellSize={6}
            />
          )}
          
          {/* Kernel Inspector */}
          <KernelInspector
            kernel={currentKernel}
            currentStep={currentStep}
            showValues={showKernelValues}
            isEditable={kernelPreset === 'custom'}
            onKernelChange={handleCustomKernelChange}
          />
          
          {/* Output */}
          <PixelGrid
            data={displayOutput}
            title="Output"
            showValues={showOutputValues}
            cellSize={convolutionResult ? Math.max(6, Math.min(12, 300 / Math.max(convolutionResult.outputDimensions.height, convolutionResult.outputDimensions.width))) : 6}
            currentStep={currentStep}
            showSumOverlay={true}
          />
        </div>
        
        {/* Image controls */}
        <div className="flex justify-center">
          <ImageUploader onImageLoad={handleImageLoad} className="w-full max-w-md" />
        </div>
        
        {/* Keyboard shortcuts hint */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>Keyboard shortcuts: <kbd className="bg-muted px-2 py-1 rounded text-xs">Space</kbd> to play/pause, <kbd className="bg-muted px-2 py-1 rounded text-xs">N</kbd> to step forward</p>
          {kernelPreset === 'custom' && (
            <p className="text-accent flex items-center justify-center gap-1">
              Click the <Edit className="w-3 h-3" /> icon in the Kernel Inspector to edit your custom filter values
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;