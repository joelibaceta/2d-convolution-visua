import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ConvolutionStep } from '@/lib/convolution';

interface PixelGridProps {
  data: number[][];
  className?: string;
  title: string;
  highlightRegion?: {
    startRow: number;
    startCol: number;
    height: number;
    width: number;
  };
  showValues?: boolean;
  onPixelHover?: (row: number, col: number, value: number) => void;
  cellSize?: number;
  currentStep?: ConvolutionStep;
  showSumOverlay?: boolean;
}

export function PixelGrid({ 
  data, 
  className, 
  title, 
  highlightRegion, 
  showValues = false,
  onPixelHover,
  cellSize = 8,
  currentStep,
  showSumOverlay = false
}: PixelGridProps) {
  const dimensions = useMemo(() => {
    if (!data.length) return { height: 0, width: 0 };
    return { height: data.length, width: data[0].length };
  }, [data]);

  const maxValue = useMemo(() => {
    if (!data.length) return 255;
    return Math.max(...data.flat());
  }, [data]);

  const minValue = useMemo(() => {
    if (!data.length) return 0;
    return Math.min(...data.flat());
  }, [data]);

  if (!data.length) {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="w-64 h-64 border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center text-muted-foreground">
          No data
        </div>
        <p className="text-sm text-muted-foreground mt-2">0×0</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      
      {/* Sum of products overlay for output */}
      {showSumOverlay && currentStep && (
        <div className="bg-accent/20 rounded-lg p-2 mb-2 text-center w-full max-w-xs">
          <div className="text-xs text-muted-foreground mb-1">
            Sum of products:
          </div>
          <div className="text-lg font-mono font-bold text-accent-foreground">
            {currentStep.sum.toFixed(3)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            → Output[{currentStep.outputRow}, {currentStep.outputCol}]
          </div>
        </div>
      )}
      
      <div 
        className="relative border border-border rounded-lg p-2 bg-card"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${dimensions.width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${dimensions.height}, ${cellSize}px)`,
          gap: '1px'
        }}
      >
        {data.map((row, i) =>
          row.map((value, j) => {
            const isHighlighted = highlightRegion && 
              i >= highlightRegion.startRow && 
              i < highlightRegion.startRow + highlightRegion.height &&
              j >= highlightRegion.startCol && 
              j < highlightRegion.startCol + highlightRegion.width;

            const normalizedValue = maxValue > minValue 
              ? (value - minValue) / (maxValue - minValue)
              : 0;

            return (
              <div
                key={`${i}-${j}`}
                className={cn(
                  "relative transition-all duration-100 cursor-pointer",
                  isHighlighted && "ring-2 ring-orange-500 ring-inset z-10"
                )}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  backgroundColor: `rgb(${Math.round(normalizedValue * 255)}, ${Math.round(normalizedValue * 255)}, ${Math.round(normalizedValue * 255)})`,
                }}
                onMouseEnter={() => onPixelHover?.(i, j, value)}
                title={`(${j}, ${i}): ${value.toFixed(2)}`}
              >
                {showValues && cellSize >= 20 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className="text-xs font-mono leading-none"
                      style={{
                        color: normalizedValue > 0.5 ? '#000000' : '#ffffff',
                        fontSize: `${Math.min(cellSize / 3, 10)}px`
                      }}
                    >
                      {Math.round(value)}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {dimensions.height}×{dimensions.width}
      </p>
    </div>
  );
}