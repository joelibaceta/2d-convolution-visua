import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ConvolutionStep, PaddingValues } from '@/lib/convolution';

interface PaddedPixelGridProps {
  originalData: number[][];
  paddedData: number[][];
  paddingValues: PaddingValues;
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
}

export function PaddedPixelGrid({ 
  originalData,
  paddedData, 
  paddingValues,
  className, 
  title, 
  highlightRegion, 
  showValues = false,
  onPixelHover,
  cellSize = 8,
  currentStep
}: PaddedPixelGridProps) {
  const dimensions = useMemo(() => {
    if (!paddedData.length) return { height: 0, width: 0 };
    return { height: paddedData.length, width: paddedData[0].length };
  }, [paddedData]);

  const maxValue = useMemo(() => {
    if (!paddedData.length) return 255;
    return Math.max(...paddedData.flat());
  }, [paddedData]);

  const minValue = useMemo(() => {
    if (!paddedData.length) return 0;
    return Math.min(...paddedData.flat());
  }, [paddedData]);

  const isPaddingPixel = useMemo(() => {
    if (!paddedData.length || !originalData.length) return () => false;
    
    return (row: number, col: number) => {
      // Check if pixel is in padding region
      const { top, left } = paddingValues;
      const originalHeight = originalData.length;
      const originalWidth = originalData[0]?.length || 0;
      
      // Bounds check first
      if (row < 0 || row >= paddedData.length || col < 0 || col >= paddedData[0].length) {
        return false;
      }
      
      return (
        row < top || 
        row >= top + originalHeight ||
        col < left || 
        col >= left + originalWidth
      );
    };
  }, [paddedData, paddingValues, originalData]);

  if (!paddedData.length) {
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
      
      <div 
        className="relative border border-border rounded-lg p-2 bg-card"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${dimensions.width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${dimensions.height}, ${cellSize}px)`,
          gap: '1px'
        }}
      >
        {paddedData.map((row, i) =>
          row.map((value, j) => {
            const isHighlighted = highlightRegion && 
              i >= highlightRegion.startRow && 
              i < highlightRegion.startRow + highlightRegion.height &&
              j >= highlightRegion.startCol && 
              j < highlightRegion.startCol + highlightRegion.width;

            const isPadding = isPaddingPixel(i, j);
            
            const normalizedValue = maxValue > minValue 
              ? (value - minValue) / (maxValue - minValue)
              : 0;

            return (
              <div
                key={`${i}-${j}`}
                className="relative cursor-pointer"
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  backgroundColor: isPadding 
                    ? `rgba(${Math.round(normalizedValue * 180)}, ${Math.round(normalizedValue * 180)}, ${Math.round(normalizedValue * 255)}, 0.7)`
                    : `rgb(${Math.round(normalizedValue * 255)}, ${Math.round(normalizedValue * 255)}, ${Math.round(normalizedValue * 255)})`,
                  border: isHighlighted ? '2px solid #f97316' : isPadding ? '1px solid rgba(59, 130, 246, 0.4)' : 'none',
                  boxSizing: 'border-box',
                  zIndex: isHighlighted ? 10 : 'auto',
                  backgroundImage: isPadding ? 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(59, 130, 246, 0.1) 1px, rgba(59, 130, 246, 0.1) 2px)' : 'none'
                }}
                onMouseEnter={() => onPixelHover?.(i, j, value)}
                title={`(${j}, ${i}): ${value.toFixed(2)}${isPadding ? ' (padding)' : ''}`}
              >
                {showValues && cellSize >= 8 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className="text-xs font-mono leading-none"
                      style={{
                        color: normalizedValue > 0.5 ? '#000000' : '#ffffff',
                        fontSize: `${Math.min(Math.max(cellSize / 3, 6), 10)}px`,
                        opacity: isPadding ? 0.7 : 1
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
        {paddingValues.top > 0 || paddingValues.bottom > 0 || paddingValues.left > 0 || paddingValues.right > 0 ? 
          ` (${originalData.length}×${originalData[0]?.length || 0} + padding)` : ''
        }
      </p>
    </div>
  );
}