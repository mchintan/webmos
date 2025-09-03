# WebMOS

A fully functional math graphing system similar to Desmos, built with React and D3.js for smooth visualizations.

## Features

### 🎯 Core Functionality
- **Interactive 2D Graphing**: Plot mathematical functions and equations on a coordinate plane
- **Multiple Equation Support**: Display multiple equations simultaneously with unique colors
- **Real-time Updates**: See changes instantly as you modify equations
- **Zoom and Pan**: Interactive navigation with mouse wheel zoom and drag pan
- **Coordinate Tooltips**: Hover to see exact coordinates on the graph

### 📊 Supported Equation Types
- **Explicit Functions**: `y = sin(x)`, `y = x^2 + 2x + 1`
- **Implicit Equations**: `x^2 + y^2 = 4` (circle), `x^2 - y^2 = 1` (hyperbola)
- **Mathematical Functions**: Trigonometric, logarithmic, exponential, and more
- **Complex Expressions**: Nested functions, constants (π, e), and mathematical operations

### 🎨 User Interface
- **Modern Sidebar**: Clean interface for managing equations
- **Color Picker**: Customize the color of each equation's graph
- **Equation Management**: Add, delete, and modify equations easily
- **Export Functionality**: Save graphs as SVG images
- **Responsive Design**: Works on desktop and mobile devices

### 🔧 Technical Features
- **Smooth Animations**: D3.js transitions for zoom and pan
- **Performance Optimized**: Efficient rendering with 1000+ sample points
- **Error Handling**: Graceful handling of invalid expressions
- **Touch Support**: Mobile-friendly interactions

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   # If you have the files locally, navigate to the project directory
   cd webmos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application

### Building for Production

```bash
npm run build
```

## Usage

### Adding Equations

1. **Enter an equation** in the input field in the sidebar
2. **Choose a color** by clicking the color picker
3. **Click "Add Equation"** or press Enter
4. **See the graph** appear on the canvas

### Supported Syntax

#### Explicit Functions
```
y = sin(x)
y = x^2 + 2x + 1
y = log(x)
y = e^x
y = sqrt(x)
```

#### Implicit Equations
```
x^2 + y^2 = 4
x^2 - y^2 = 1
x^3 + y^3 = 1
```

#### Mathematical Functions
- **Trigonometric**: `sin(x)`, `cos(x)`, `tan(x)`, `sin^2(x)`, `cos^2(x)`, `asin(x)`, `acos(x)`, `atan(x)`
- **Hyperbolic**: `sinh(x)`, `cosh(x)`, `tanh(x)`
- **Logarithmic**: `log(x)`, `log10(x)`
- **Exponential**: `exp(x)`, `e^x`
- **Power**: `x^2`, `sqrt(x)`, `pow(x, 3)`
- **Other**: `abs(x)`, `floor(x)`, `ceil(x)`, `round(x)`

#### Constants
- `pi` - π (3.14159...)
- `e` - Euler's number (2.71828...)

### Graph Navigation

- **Zoom**: Use mouse wheel to zoom in/out
- **Pan**: Click and drag to move around the graph
- **Reset View**: Click the "Reset View" button to return to default view

### Managing Equations

- **Change Color**: Click the color square next to any equation
- **Delete Equation**: Click the "×" button to remove an equation
- **Clear All**: Use "Clear All Equations" to remove everything
- **Export**: Click "Export as SVG" to save the current graph

## Examples

Try these example equations to get started:

1. **Basic Functions**
   - `y = x`
   - `y = x^2`
   - `y = sin(x)`

2. **Complex Functions**
   - `y = sin(x) * cos(x)`
   - `y = sin^2(x)` (sine squared)
   - `y = cos^2(x)` (cosine squared)
   - `y = e^(-x^2/2)` (Gaussian)
   - `y = log(abs(x))`

3. **Implicit Equations**
   - `x^2 + y^2 = 4` (circle)
   - `x^2 - y^2 = 1` (hyperbola)
   - `x^3 + y^3 = 1`

## Technology Stack

- **React 18**: Modern React with hooks
- **D3.js**: Data visualization and SVG manipulation
- **Math.js**: Mathematical expression parsing and evaluation
- **React Color**: Color picker component
- **CSS3**: Modern styling with flexbox and transitions

## Project Structure

```
src/
├── components/
│   ├── GraphCanvas.js      # Main graphing component with D3.js
│   ├── Sidebar.js         # Equation management sidebar
│   ├── EquationList.js    # List of equations with controls
│   ├── EquationInput.js   # Input component for new equations
│   └── *.css              # Component-specific styles
├── utils/
│   └── mathUtils.js       # Mathematical expression utilities
├── App.js                 # Main application component
├── index.js              # React entry point
└── *.css                 # Global styles
```

## Performance Features

- **Efficient Rendering**: Only re-renders when necessary
- **Optimized Sampling**: 1000+ points for smooth curves
- **Memory Management**: Proper cleanup of D3 elements
- **Responsive Design**: Adapts to different screen sizes

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.
