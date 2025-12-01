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

## Reference:
*Coherent Detection in Optical Communications*
https://www.rp-photonics.com/coherent_detection.html
