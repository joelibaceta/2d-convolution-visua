import { Play, Pause, SkipForward, RotateCounterClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { KERNEL_PRESETS, PaddingType } from '@/lib/convolution';

interface AnimationControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStep: () => void;
  onReset: () => void;
  
  animationSpeed: number;
  onAnimationSpeedChange: (speed: number) => void;
  
  kernelSize: number;
  onKernelSizeChange: (size: number) => void;
  
  stride: number;
  onStrideChange: (stride: number) => void;
  
  padding: PaddingType;
  onPaddingChange: (padding: PaddingType) => void;
  
  kernelPreset: keyof typeof KERNEL_PRESETS | 'custom';
  onKernelPresetChange: (preset: keyof typeof KERNEL_PRESETS | 'custom') => void;
  
  showInputValues: boolean;
  onShowInputValuesChange: (show: boolean) => void;
  
  showKernelValues: boolean;
  onShowKernelValuesChange: (show: boolean) => void;
  
  showOutputValues: boolean;
  onShowOutputValuesChange: (show: boolean) => void;
  
  normalizeOutput: boolean;
  onNormalizeOutputChange: (normalize: boolean) => void;
  
  currentStep: number;
  totalSteps: number;
}

const KERNEL_SIZES = [1, 3, 5, 7, 9];
const STRIDES = [1, 2, 3, 4];
const PADDING_OPTIONS: { value: PaddingType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'zero', label: 'Zero' },
  { value: 'reflect', label: 'Reflect' }
];

export function AnimationControls({
  isPlaying,
  onPlayPause,
  onStep,
  onReset,
  animationSpeed,
  onAnimationSpeedChange,
  kernelSize,
  onKernelSizeChange,
  stride,
  onStrideChange,
  padding,
  onPaddingChange,
  kernelPreset,
  onKernelPresetChange,
  showInputValues,
  onShowInputValuesChange,
  showKernelValues,
  onShowKernelValuesChange,
  showOutputValues,
  onShowOutputValuesChange,
  normalizeOutput,
  onNormalizeOutputChange,
  currentStep,
  totalSteps
}: AnimationControlsProps) {

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Animation Controls */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Animation</h4>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onPlayPause}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onStep}
              disabled={isPlaying}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
            >
              <RotateCounterClockwise className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Speed: {animationSpeed}ms</Label>
            <Slider
              value={[animationSpeed]}
              onValueChange={([value]) => onAnimationSpeedChange(value)}
              min={50}
              max={2000}
              step={50}
              className="w-full"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Convolution Parameters */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Parameters</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Kernel Size</Label>
              <Select value={kernelSize.toString()} onValueChange={(v) => onKernelSizeChange(parseInt(v))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KERNEL_SIZES.map(size => (
                    <SelectItem key={size} value={size.toString()}>{size}×{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Stride</Label>
              <Select value={stride.toString()} onValueChange={(v) => onStrideChange(parseInt(v))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRIDES.map(s => (
                    <SelectItem key={s} value={s.toString()}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Padding</Label>
            <Select value={padding} onValueChange={(v) => onPaddingChange(v as PaddingType)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PADDING_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Kernel Presets */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Kernel Preset</h4>
          <Select value={kernelPreset} onValueChange={(v) => onKernelPresetChange(v as keyof typeof KERNEL_PRESETS | 'custom')}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(KERNEL_PRESETS).map(([key, preset]) => (
                <SelectItem key={key} value={key}>{preset.name}</SelectItem>
              ))}
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Switch
              id="normalize-output"
              checked={normalizeOutput}
              onCheckedChange={onNormalizeOutputChange}
            />
            <Label htmlFor="normalize-output" className="text-xs">
              Normalize output
            </Label>
          </div>
        </div>

        {/* Display Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Display Options</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-input-values"
                checked={showInputValues}
                onCheckedChange={onShowInputValuesChange}
              />
              <Label htmlFor="show-input-values" className="text-xs">
                Input values
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-kernel-values"
                checked={showKernelValues}
                onCheckedChange={onShowKernelValuesChange}
              />
              <Label htmlFor="show-kernel-values" className="text-xs">
                Kernel values
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-output-values"
                checked={showOutputValues}
                onCheckedChange={onShowOutputValuesChange}
              />
              <Label htmlFor="show-output-values" className="text-xs">
                Output values
              </Label>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}