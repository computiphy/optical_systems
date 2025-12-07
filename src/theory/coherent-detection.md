# Coherent Detection and Heterodyning

## Overview
Coherent detection is a technique that mixes the received optical signal with a Local Oscillator (LO) to recover both amplitude and phase information. This enables the use of advanced modulation formats and digital signal processing.

## Principle of Operation

### Optical Mixing
When two optical fields (Signal Es and LO ELO) combine at a photodetector, the output photocurrent is proportional to the square of the total field:

**I(t) ∝ |Es + ELO|²**

Expanding this:
**I(t) = |Es|² + |ELO|² + 2|Es||ELO|cos(Δωt + Δφ)**

### Components of the Photocurrent

1. **DC Terms**: |Es|² + |ELO|² (constant background)
2. **Beat Term**: 2|Es||ELO|cos(Δωt + Δφ) (contains the signal information)

where:
- Δω = ωs - ωLO (frequency offset)
- Δφ = φs - φLO (phase offset)

### Heterodyne vs Homodyne
- **Heterodyne**: LO frequency ≠ Signal frequency (Δω ≠ 0)
  - Beat signal oscillates at intermediate frequency
  - Requires additional frequency recovery
  
- **Homodyne**: LO frequency = Signal frequency (Δω = 0)
  - Direct baseband detection
  - Requires precise frequency locking

## 90° Optical Hybrid
In practice, a 90° hybrid splits the mixed signal into I and Q components:
- **I component**: cos(Δωt + Δφ)
- **Q component**: sin(Δωt + Δφ)

## Phase Recovery
A Phase-Locked Loop (PLL) or digital signal processing algorithms track and compensate for:
1. **Frequency offset** (Δω)
2. **Phase offset** (Δφ)
3. **Laser phase noise**

Once locked, the recovered phase reveals the transmitted data encoded in the phase modulation.

## References
1. K. Kikuchi, "Fundamentals of Coherent Optical Fiber Communications," *Journal of Lightwave Technology*, vol. 34, no. 1, pp. 157-179, 2016.
2. S. J. Savory, "Digital filters for coherent optical receivers," *Optics Express*, vol. 16, no. 2, pp. 804-817, 2008.
3. E. Ip and J. M. Kahn, "Compensation of Dispersion and Nonlinear Impairments Using Digital Backpropagation," *Journal of Lightwave Technology*, vol. 26, no. 20, pp. 3416-3425, 2008.
4. M. G. Taylor, "Coherent detection method using DSP for demodulation of signal and subsequent equalization of propagation impairments," *IEEE Photonics Technology Letters*, vol. 16, no. 2, pp. 674-676, 2004.
5. C. R. S. Fludger et al., "Coherent Equalization and POLMUX-RZ-DQPSK for 2x100G Transmission," *OFC/NFOEC*, 2008.
