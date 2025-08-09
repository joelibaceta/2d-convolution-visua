# 2D Convolution Visualizer

An interactive educational tool that visually demonstrates how 2D convolutions work by animating the kernel sliding process over uploaded images.

**Experience Qualities**:
1. **Educational** - Makes complex mathematical operations intuitive through step-by-step visual demonstration
2. **Interactive** - Provides immediate feedback and control over convolution parameters for experimentation
3. **Performant** - Maintains smooth 60fps animation even with 64x64 grids and real-time calculations

**Complexity Level**: Light Application (multiple features with basic state)
The app handles image processing, animation state, and multiple configurable parameters while maintaining a focused single-page experience.

## Essential Features

**Image Upload & Processing**
- Functionality: Upload any image format, automatically resize to 64x64, convert to grayscale
- Purpose: Provides consistent input data for convolution demonstration
- Trigger: File input or drag-and-drop
- Progression: Upload → Resize → Convert → Display as pixel grid
- Success criteria: Any image becomes a 64x64 grayscale grid with visible pixel values

**Interactive Convolution Animation**
- Functionality: Animate kernel sliding over image with configurable parameters
- Purpose: Visualizes the core mathematical operation of convolution
- Trigger: Play button or spacebar
- Progression: Start → Highlight input region → Show computation → Fill output pixel → Advance → Repeat
- Success criteria: Smooth animation showing kernel movement and output generation

**Configurable Parameters**
- Functionality: Adjust kernel size, stride, padding, and presets
- Purpose: Demonstrates how different parameters affect convolution results
- Trigger: Control panel inputs
- Progression: Change parameter → Recalculate output dimensions → Reset animation state
- Success criteria: Parameter changes immediately update visualization and math

**Step-by-Step Computation Display**
- Functionality: Show element-wise multiplication and summation for current kernel position
- Purpose: Makes the mathematical operation transparent and educational
- Trigger: Animation step or manual stepping
- Progression: Position kernel → Extract input patch → Display multiplication → Show sum
- Success criteria: Users can follow the exact math happening at each step

**Kernel Presets & Custom Kernels**
- Functionality: Common computer vision kernels (identity, blur, edge detection)
- Purpose: Demonstrates practical applications of different kernel types
- Trigger: Preset selection dropdown
- Progression: Select preset → Load kernel values → Update visualization
- Success criteria: Different presets produce visually distinct output effects

## Edge Case Handling

- **Large Images**: Automatic downscaling prevents performance issues
- **Invalid Uploads**: Clear error messages for unsupported file types
- **Extreme Parameters**: Validation prevents impossible configurations (output size < 1)
- **Animation Interruption**: Clean state reset when parameters change mid-animation
- **Mobile Usage**: Responsive layout adapts to smaller screens with touch controls

## Design Direction

The interface should feel like a sophisticated educational tool - clean, technical, and focused. Think of a blend between scientific visualization software and modern web apps. Minimal visual noise to keep attention on the mathematical concepts being demonstrated.

## Color Selection

Triadic color scheme to clearly differentiate the three main areas (input, kernel, output).

- **Primary Color**: Deep blue (#1e40af) - Represents the analytical, mathematical nature of convolution
- **Secondary Colors**: Warm orange (#f97316) for highlighting active regions, cool gray (#64748b) for static elements
- **Accent Color**: Bright green (#10b981) for successful operations and play controls
- **Foreground/Background Pairings**: 
  - Background (White #ffffff): Dark text (#0f172a) - Ratio 16.7:1 ✓
  - Card (Light gray #f8fafc): Dark text (#0f172a) - Ratio 15.8:1 ✓
  - Primary (Deep blue #1e40af): White text (#ffffff) - Ratio 8.6:1 ✓
  - Accent (Green #10b981): White text (#ffffff) - Ratio 4.7:1 ✓

## Font Selection

Technical clarity with modern readability - Inter for UI elements and Source Code Pro for numeric values to distinguish data from interface.

**Typographic Hierarchy**:
- H1 (App Title): Inter Bold/28px/tight letter spacing
- H2 (Section Labels): Inter Semibold/18px/normal spacing  
- Body (Controls): Inter Regular/14px/relaxed line height
- Code (Pixel Values): Source Code Pro Regular/12px/monospace for alignment
- Small (Dimensions): Inter Regular/12px/muted color

## Animations

Purposeful motion that directly illustrates the convolution process - the kernel sliding animation is the centerpiece, with subtle hover effects and state transitions supporting the educational goal.

**Purposeful Meaning**: The primary animation (kernel sliding) directly maps to the mathematical operation being taught
**Hierarchy of Movement**: Kernel movement takes priority, followed by output filling, with UI transitions kept minimal

## Component Selection

**Components**: 
- Cards for distinct areas (input, kernel, output grids)
- Buttons for controls with clear visual hierarchy
- Sliders for continuous parameters like animation speed
- Select dropdowns for discrete choices like kernel presets
- Input file upload with drag-and-drop styling

**Customizations**: 
- Custom PixelGrid component for efficient 64x64 rendering
- Custom KernelWindow with numeric overlays
- Custom AnimationControls with keyboard shortcuts

**States**:
- Buttons: Clear hover/active states with color transitions
- Grids: Highlighted cells for active regions
- Controls: Disabled states during animation

**Icon Selection**: 
- Play/Pause icons for animation controls
- Upload icon for file input
- Settings gear for configuration
- Step forward/backward arrows

**Spacing**: 
- Grid gap of 4px between major sections
- 2px padding within pixel cells
- 8px margins around control groups

**Mobile**: 
- Stack grids vertically on small screens
- Larger touch targets for controls
- Collapsible parameter panel to save space