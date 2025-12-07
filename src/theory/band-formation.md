## Why `BW ≈ R_s(1+α)` — detailed explanation

At the heart of digital modulation is a sequence of symbols, each lasting *T_s = 1/R_s* seconds. If you send a single symbol that lasts exactly *T_s* seconds and then stop, its Fourier transform is a **sinc()**-shaped spectrum. The main lobe width of this sinc (between first nulls) is proportional to *1/T_s* — i.e. proportional to the symbol rate *R_s*.

Pulse-shaping (commonly root-raised-cosine, RRC) smooths the time-domain edges to reduce inter-symbol interference (ISI). The roll-off factor *α* controls how much extra spectral width is allowed beyond the Nyquist minimum. A raised-cosine-shaped spectrum occupies a frequency interval of *R_s/2* to *R_s(1+α)/2* on each side of the carrier (baseband). For bandpass representation this leads to the approximate occupied bandwidth:

> **Rule of thumb:**
>
> BW ≈ R_s (1 + α)
>
> (where α ∈ [0,1] is the roll-off; α=0 is ideal Nyquist, α=1 is full roll-off)

### Visual intuition
1. **Symbol duration → spectral width:** shorter symbols (higher *R_s*) mean the waveform changes faster in time, which requires higher frequency components to represent — hence broader spectrum.
2. **Pulse shaping & α:** sharper pulses (smaller *α*) concentrate energy into a narrower main lobe; larger *α* means the spectrum's shoulders are wider.
3. **Discrete vs continuous:** a long random symbol stream produces many closely spaced frequency components that blend into a continuous-looking band — the DFT bin spacing is *1/T_obs*, so with long observation time the spectral lines are densely packed.

### Short math derivation (intuition-level)
Consider ideal Nyquist pulses (raised cosine). The single-sided bandwidth of a Nyquist pulse is *R_s/2*. With roll-off *α*, the single-sided bandwidth becomes *R_s(1+α)/2*, so two-sided occupied bandwidth is *R_s(1+α)*.

### Analogy
Think of representing a sudden, short clap of sound: to reproduce that short time event you need high-frequency harmonics. If the clap lasts longer (low symbol rate), fewer high frequencies are needed and the audio (spectrum) is narrower.

### Why modulation order doesn't directly change BW
The constellation size (e.g., 16QAM vs QPSK) changes how many bits are carried per symbol but not the symbol duration. Therefore, for the same *R_s* and *α*, the occupied bandwidth is approximately the same. Higher-order constellations often require different filtering and higher SNR, which can lead to practical spectral differences, but the primary bandwidth dependence is on *R_s* and *α*.

### References
1. G. P. Agrawal, *Fiber-Optic Communication Systems*, 4th ed., Wiley, 2010.
2. J. G. Proakis and M. Salehi, *Digital Communications*, 5th ed., McGraw-Hill, 2008.
3. R. W. Tkach, "Scaling Optical Communications for the Next Decade and Beyond," *Bell Labs Technical Journal*, vol. 14, no. 4, pp. 3-20, 2010.
4. P. J. Winzer, "High-Spectral-Efficiency Optical Modulation Formats," *Journal of Lightwave Technology*, vol. 30, no. 24, pp. 3824-3835, 2012.
5. G. Bosco et al., "On the Performance of Nyquist-WDM Terabit Superchannels Based on PM-BPSK, PM-QPSK, PM-8QAM or PM-16QAM Subcarriers," *Journal of Lightwave Technology*, vol. 29, no. 1, pp. 53-61, 2011.
6. M. Rice, *Digital Communications: A Discrete-Time Approach*, Pearson, 2008.
