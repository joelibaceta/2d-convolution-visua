import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ConvolutionStep } from '@/lib/convolution';

interface KernelInspectorProps {
  kernel: number[][];
  currentStep?: ConvolutionStep;
  showValues?: boolean;
  className?: string;
}

export function KernelInspector({ 
  kernel, 
  currentStep, 
  showValues = true, 
  className 
}: KernelInspectorProps) {
  const kernelSize = kernel.length;
  const cellSize = Math.max(20, Math.min(32, 150 / kernelSize));

  const maxKernelValue = useMemo(() => {
    return Math.max(...kernel.flat().map(Math.abs));
  }, [kernel]);

  const renderGrid = (
    title: string, 
    data: number[][], 
    colorMode: 'kernel' | 'input' | 'product'
  ) => (
    <div className="flex flex-col items-center">
      <h4 className="text-xs font-medium mb-1">{title}</h4>
      <div 
        className="border border-border rounded p-1 bg-card"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${kernelSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${kernelSize}, ${cellSize}px)`,
          gap: '1px'
        }}
      >
        {data.map((row, i) =>
          row.map((value, j) => {
            let backgroundColor = '#f8fafc';
            let textColor = '#0f172a';

            if (colorMode === 'kernel') {
              const intensity = maxKernelValue > 0 ? Math.abs(value) / maxKernelValue : 0;
              const hue = value >= 0 ? '210' : '0'; // Blue for positive, red for negative
              backgroundColor = `hsl(${hue}, 60%, ${90 - intensity * 40}%)`;
              textColor = intensity > 0.7 ? '#ffffff' : '#0f172a';
            } else if (colorMode === 'input' || colorMode === 'product') {
              const normalizedValue = Math.max(0, Math.min(255, value)) / 255;
              const grayValue = Math.round(normalizedValue * 255);
              backgroundColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
              textColor = normalizedValue > 0.5 ? '#000000' : '#ffffff';
            }

            return (
              <div
                key={`${i}-${j}`}
                className="flex items-center justify-center relative transition-colors duration-200"
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  backgroundColor,
                  color: textColor
                }}
                title={`(${j}, ${i}): ${value.toFixed(3)}`}
              >
                {showValues && (
                  <span 
                    className="font-mono text-xs font-medium"
                    style={{ fontSize: `${Math.min(cellSize / 3.5, 8)}px` }}
                  >
                    {Math.abs(value) < 0.001 ? '0' : value.toFixed(1)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      <h3 className="text-lg font-semibold">Kernel Inspector</h3>
      
      <div className="flex flex-col gap-3">
        {renderGrid("Kernel", kernel, 'kernel')}
        
        {currentStep && (
          <>
            {renderGrid("Input Patch", currentStep.inputPatch, 'input')}
            {renderGrid("Element-wise Product", currentStep.elementWiseProducts, 'product')}
          </>
        )}
      </div>



      <div className="text-xs text-muted-foreground">
        {kernelSize}×{kernelSize}
      </div>
    </div>
  );
}