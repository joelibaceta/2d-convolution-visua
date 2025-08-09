import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Edit } from '@phosphor-icons/react';
import { ImageUploader } from '@/components/ImageUploader';
import { PixelGrid } from '@/components/PixelGrid';
import { KernelInspector } from '@/components/KernelInspector';
import { AnimationControls } from '@/components/AnimationControls';
import { generateCheckerboard } from '@/lib/sampleImages';
import { 
  resizeTo64, 
  convolve2D, 
  generateKernel, 
  normalizeOutput as normalizeOutputValues, 
  clampOutput,
  KERNEL_PRESETS,
  PaddingType,
  ConvolutionResult,
  ConvolutionStep 
} from '@/lib/convolution';
import { testConvolutionDimensions, testSquareConvolution } from '@/lib/convolution.test';

function App() {
  // Run tests in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      testConvolutionDimensions();
      testSquareConvolution();
    }
  }, []);
  // Initialize with a default sample image
  const [inputImage, setInputImage] = useKV<number[][]>('input-image', generateCheckerboard());
  const [convolutionResult, setConvolutionResult] = useState<ConvolutionResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useKV('animation-speed', 500);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Convolution parameters
  const [kernelSize, setKernelSize] = useKV('kernel-size', 3);
  const [stride, setStride] = useKV('stride', 1);
  const [padding, setPadding] = useKV<PaddingType>('padding', 'none');
  const [kernelPreset, setKernelPreset] = useKV<keyof typeof KERNEL_PRESETS | 'custom'>('kernel-preset', 'sharpen');
  const [customKernel, setCustomKernel] = useState<number[][]>(() => {
    // Initialize with a 3x3 edge detection kernel as a more interesting default
    return [
      [0, -1, 0],
      [-1, 4, -1], 
      [0, -1, 0]
    ];
  });
  
  // Display options  
  const [showInputValues, setShowInputValues] = useKV<boolean>('show-input-values', false);
  const [showKernelValues, setShowKernelValues] = useKV<boolean>('show-kernel-values', true);
  const [showOutputValues, setShowOutputValues] = useKV<boolean>('show-output-values', false);
  const [normalizeOutput, setNormalizeOutput] = useKV<boolean>('normalize-output', false);
  
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
  }, [setKernelPreset, currentKernel]);
  
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
  }, [setKernelSize, kernelPreset]);
  
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
  
  const highlightRegion = currentStep && inputImage.length > 0 ? (() => {
    const kernelHeight = currentKernel.length;
    const kernelWidth = currentKernel[0]?.length || 0;
    
    // The currentStep.position is already calculated relative to the original input
    // (accounting for padding offset in the convolution function)
    const kernelRow = currentStep.position.row;
    const kernelCol = currentStep.position.col;
    
    // Calculate the intersection of the kernel with the visible input region
    const startRow = Math.max(0, kernelRow);
    const startCol = Math.max(0, kernelCol);
    const endRow = Math.min(inputImage.length, kernelRow + kernelHeight);
    const endCol = Math.min(inputImage[0].length, kernelCol + kernelWidth);
    
    // Only create highlight if there's a visible region
    if (startRow < endRow && startCol < endCol && 
        startRow < inputImage.length && startCol < inputImage[0].length) {
      
      const region = {
        startRow,
        startCol,
        height: endRow - startRow,
        width: endCol - startCol
      };
      
      return region;
    }
    
    return undefined;
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
          <PixelGrid
            data={inputImage}
            title="Input Image"
            highlightRegion={highlightRegion}
            showValues={showInputValues}
            cellSize={6}
          />
          
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