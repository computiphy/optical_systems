# Widely Tunable DBR Laser with ISG Mirrors

## Core Physics & Logic

### The Vernier Effect

The laser cavity consists of two mirrors (Mirror A and Mirror B) and a gain/phase section. Each mirror has a "comb-like" reflectivity spectrum with multiple peaks. The key to wide tunability lies in the **Vernier Effect**:

1.  **Peak Spacing**: The peak spacing ($\Delta\lambda$) of Mirror A and Mirror B is slightly different.
2.  **Supermode**: Lasing occurs only at the wavelength where a peak from Mirror A aligns with a peak from Mirror B. This aligned peak is called the "Supermode".
3.  **Side Mode Suppression**: All other peaks are misaligned, resulting in low net reflectivity and thus suppressing those modes.

### Novel Interleaved Sampled Grating (ISG) Mirrors

Unlike standard Sampled Gratings which typically have a Sinc-shaped envelope (resulting in uneven peak heights), the **Novel ISG Mirrors** used in this laser feature a **flat-top envelope**.

*   **Benefit**: This ensures that all reflection peaks across the tuning range have uniform strength.
*   **Result**: Uniform lasing performance (threshold current, output power) across the entire tuning range.

**Reference:**
*Novel interleaved sampled grating mirrors for widely tunable dbr lasers*

## Tuning Mechanisms

The laser is tuned using three main controls, often represented as currents injected into micro-heaters on the chip:

1.  **Phase Section**: Fine-tunes the cavity mode by changing the refractive index of the phase section. This shifts the Fabry-Perot modes of the cavity.
2.  **DMA (Differential Mode Adjustment)**:
    *   Moves the reflectivity spectra of Mirror A and Mirror B in **opposite directions**.
    *   This causes the alignment point (Supermode) to "jump" from one peak to the next.
    *   Used for **Coarse Tuning** or **Mode Hops**.
3.  **CMA (Common Mode Adjustment)**:
    *   Moves the reflectivity spectra of Mirror A and Mirror B in the **same direction**.
    *   The aligned wavelength shifts smoothly without hopping.
    *   Used for **Fine Tuning** the wavelength.

## Operating Map

The stability of the laser modes can be visualized on a 2D map of Heater Current A vs. Heater Current B.

*   **Islands of Stability**: Stable lasing modes form a grid of diamond or parallelogram-shaped "islands".
*   **Mode Hops**: Crossing the boundary between islands results in a mode hop (discrete wavelength jump).
*   **Tuning Trajectories**:
    *   **CMA**: Moves along the $y=x$ diagonal (smooth tuning).
    *   **DMA**: Moves along the $y=-x$ diagonal (mode hopping).

## References
1. L. A. Coldren et al., "Tunable Semiconductor Lasers: A Tutorial," *Journal of Lightwave Technology*, vol. 22, no. 1, pp. 193-202, 2004.
2. G. A. Fish et al., "Monolithic widely tunable DBR lasers," *IEEE Journal of Selected Topics in Quantum Electronics*, vol. 7, no. 2, pp. 248-256, 2001.
3. J. Buus and E. J. Murphy, "Tunable lasers and coherent optical systems," *Journal of Lightwave Technology*, vol. 24, no. 1, pp. 5-11, 2006.
4. B. Mason et al., "Widely tunable sampled grating DBR laser with integrated electroabsorption modulator," *IEEE Photonics Technology Letters*, vol. 11, no. 6, pp. 638-640, 1999.
5. V. Jayaraman et al., "Theory, design, and performance of extended tuning range semiconductor lasers with sampled gratings," *IEEE Journal of Quantum Electronics*, vol. 29, no. 6, pp. 1824-1834, 1993.