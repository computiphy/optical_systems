// Generate square QAM constellations (16QAM, 64QAM)
export const generateSquareQAM = (size) => {
    const points = [];
    const offset = size - 1.0;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            // Normalize to roughly -1 to 1 range
            points.push([(2 * i - offset) / offset, (2 * j - offset) / offset]);
        }
    }
    return points;
};

// Base definitions
export const getModDefs = () => {
    const defs = {
        'BPSK': { bits: 1, points: [[-1, 0], [1, 0]] },
        'QPSK': { bits: 2, points: [[-0.7, 0.7], [0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]] },
        '8QAM': {
            bits: 3, points: [
                [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5],
                [1.2, 0], [-1.2, 0], [0, 1.2], [0, -1.2]
            ]
        },
        '16QAM': { bits: 4, points: [] },
        '32QAM': { bits: 5, points: [] },
        '64QAM': { bits: 6, points: [] },
    };

    // Populate large arrays dynamically
    defs['16QAM'].points = generateSquareQAM(4);
    defs['64QAM'].points = generateSquareQAM(8);

    // 32QAM (Cross shape)
    const full36 = generateSquareQAM(6);
    defs['32QAM'].points = full36.filter((p) => {
        const x = Math.abs(p[0]);
        const y = Math.abs(p[1]);
        return !(x > 0.8 && y > 0.8); // Remove corners
    });

    return defs;
};