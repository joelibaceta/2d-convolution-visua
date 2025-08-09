import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { ConvolutionStep } from '@/lib/convolution';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X } from '@phosphor-icons/react';

interface KernelInspectorProps {
  kernel: number[][];
  currentStep?: ConvolutionStep;
  showValues?: boolean;
  className?: string;
  isEditable?: boolean;
  onKernelChange?: (newKernel: number[][]) => void;
}

export function KernelInspector({ 
  kernel, 
  currentStep, 
  showValues = true, 
  className,
  isEditable = false,
  onKernelChange
}: KernelInspectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<string[][]>([]);
  
  const kernelSize = kernel.length;
  const cellSize = Math.max(12, Math.min(20, 80 / kernelSize)); // Even smaller cells for compact layout

  const maxKernelValue = useMemo(() => {
    return Math.max(...kernel.flat().map(Math.abs));
  }, [kernel]);
  
  // Debug check for very small values in large kernels
  const hasSmallValues = useMemo(() => {
    return kernel.flat().some(val => Math.abs(val) > 0 && Math.abs(val) < 0.001);
  }, [kernel]);
  
  const kernelSum = useMemo(() => {
    return kernel.flat().reduce((sum, val) => sum + val, 0);
  }, [kernel]);

  const startEditing = () => {
    setEditValues(kernel.map(row => row.map(val => val.toString())));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValues([]);
  };

  const applyEditing = () => {
    try {
      const newKernel = editValues.map(row => 
        row.map(val => {
          const num = parseFloat(val);
          return isNaN(num) ? 0 : num;
        })
      );
      onKernelChange?.(newKernel);
      setIsEditing(false);
      setEditValues([]);
    } catch (error) {
      console.error('Error parsing kernel values:', error);
    }
  };

  const updateEditValue = (row: number, col: number, value: string) => {
    const newEditValues = [...editValues];
    newEditValues[row][col] = value;
    setEditValues(newEditValues);
  };

  const renderGrid = (
    title: string, 
    data: number[][], 
    colorMode: 'kernel' | 'input' | 'product',
    editable: boolean = false
  ) => (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="text-xs font-medium">{title}</h4>
        {editable && isEditable && !isEditing && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={startEditing} 
            className="h-5 w-5 p-0 hover:bg-accent/20"
            title="Edit kernel values"
          >
            <Pencil className="h-3 w-3 text-accent" />
          </Button>
        )}
      </div>
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
                  backgroundColor: !isEditing || !editable ? backgroundColor : '#ffffff',
                  color: textColor,
                  border: isEditing && editable ? '1px solid #ccc' : 'none'
                }}
                title={`(${j}, ${i}): ${value.toFixed(3)}`}
              >
                {isEditing && editable ? (
                  <Input
                    value={editValues[i]?.[j] || '0'}
                    onChange={(e) => updateEditValue(i, j, e.target.value)}
                    className="w-full h-full text-xs p-0 border-0 text-center bg-transparent"
                    style={{ fontSize: `${Math.min(cellSize / 4, 7)}px` }}
                  />
                ) : showValues ? (
                  <span 
                    className="font-mono text-xs font-medium"
                    style={{ fontSize: `${Math.min(Math.max(cellSize / 4, 6), 8)}px` }}
                  >
                    {Math.abs(value) < 0.0001 ? '0' : 
                     Math.abs(value) < 0.001 ? value.toFixed(4) :
                     Math.abs(value) < 0.01 ? value.toFixed(3) :
                     Math.abs(value) < 0.1 ? value.toFixed(2) :
                     value.toFixed(1)}
                  </span>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Kernel Inspector</h3>
        {isEditing && (
          <div className="flex gap-1">
            <Button size="sm" variant="default" onClick={applyEditing} className="h-6 px-2">
              <Check className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEditing} className="h-6 px-2">
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-1"> {/* Reduced gap for more compact layout */}
        {renderGrid("Kernel", kernel, 'kernel', true)}
        
        {currentStep && (
          <>
            {renderGrid("Input Patch", currentStep.inputPatch, 'input')}
            {renderGrid("Products", currentStep.elementWiseProducts, 'product')}
          </>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <div>{kernelSize}×{kernelSize}</div>
        <div>Sum: {kernelSum.toFixed(3)}</div>
        <div>Max: {maxKernelValue.toFixed(3)}</div>
        {hasSmallValues && <div className="text-accent">Contains very small values</div>}
      </div>
    </div>
  );
}