# Optical System

An interactive educational platform designed to visualize and simulate key concepts in optical communications. This application provides dynamic visualizations for Lasers, Modulation formats, Mach-Zehnder Modulators (MZM), and Coherent Detection systems.

## Features

*   **Widely Tunable DBR Laser**: Interactive control of Phase, DMA, and CMA currents with visualization of the mode stability map and spectral response.
*   **Modulation & Constellation**: Real-time visualization of various modulation formats (QPSK, 16-QAM, etc.) and their constellation diagrams.
*   **Mach-Zehnder Modulator (MZM)**:
    *   Detailed Super-MZM (I/Q) architecture visualization.
    *   Interactive transfer curves and bias control.
    *   Simulation of I/Q drive waveforms and optical field evolution.
*   **Coherent Detection**: Visualization of signal mixing, beat frequencies, and phase recovery.
*   **Theory Integration**: Integrated markdown-based theoretical explanations for each module.
*   **Responsive Design**: Modern UI with dark/light mode support.

## Prerequisites

Before you begin, ensure you have the following installed:
*   **Node.js** (v18 or higher recommended)
*   **npm** (Node Package Manager)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd optical-control-system
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

### Development Server
To start the development server with hot reload:
```bash
npm run dev
```
Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

### Production Build
To build the application for production:
```bash
npm run build
```
The build artifacts will be stored in the `dist/` directory.

### Preview Production Build
To preview the production build locally:
```bash
npm run preview
```

## Technology Stack

*   **Framework**: [React](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Markdown Rendering**: [React Markdown](https://github.com/remarkjs/react-markdown)

## Project Structure

```
src/
├── components/     # Reusable UI components (Cards, Sliders, Layout)
├── context/        # React Context (ThemeContext)
├── modules/        # Feature modules (Laser, MZM, Modulation, etc.)
├── theory/         # Markdown files containing theoretical background
├── App.jsx         # Main application component
└── main.jsx        # Entry point
```
