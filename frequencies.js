// Frequencies and Scales for Different TET Systems
const frequencies = {
    baseFrequencies: {
        'C': 261.63,
        'C#': 277.18,
        'D': 293.66,
        'D#': 311.13,
        'E': 329.63,
        'F': 349.23,
        'F#': 369.99,
        'G': 392.00,
        'G#': 415.30,
        'A': 440.00,
        'A#': 466.16,
        'B': 493.88,
    },
    scales: {
        '12': {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            pentatonic: [0, 2, 4, 7, 9],
            chromatic: [...Array(12).keys()],
            blues: [0, 3, 5, 6, 7, 10]
        },
        '5': {
            pentatonic: [0, 1, 2, 3, 4],
            chromatic: [...Array(5).keys()]
        },
        '24': {
            chromatic: [...Array(24).keys()]
        },
        '31': {
            chromatic: [...Array(31).keys()]
        },
        '48': {
            chromatic: [...Array(48).keys()]
        }
    },
    getFrequencies: function(tet, key, scaleName) {
        let baseFreq = 440.00; // Default base frequency

        if (tet === '12' && this.baseFrequencies[key]) {
            baseFreq = this.baseFrequencies[key];
        } else if (key === 'A') {
            baseFreq = 440.00;
        }

        let n = parseInt(tet);
        let scale;

        if (this.scales[tet] && this.scales[tet][scaleName]) {
            scale = this.scales[tet][scaleName];
        } else {
            // Default to chromatic scale if scale not found
            scale = [...Array(n).keys()];
        }

        return scale.map(step => {
            return baseFreq * Math.pow(2, step / n);
        });
    }
};
