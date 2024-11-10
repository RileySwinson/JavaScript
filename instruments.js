const violinSynth = new Synth({
    oscillators: [
        { waveform: WaveformType.SAWTOOTH, detune: 0, volume: 0.6 },   // Base sawtooth for harmonic richness
        { waveform: WaveformType.SINE, detune: 5, volume: 0.3 },       // Slightly detuned sine for warmth
        { waveform: WaveformType.SINE, detune: -5, volume: 0.3 }       // Another slightly detuned sine for body
    ],
    filter: { 
        type: "lowpass", 
        frequency: 1200 // Softens the higher frequencies, simulating body resonance
    },
    attack: 0.05,     // Short attack to mimic the initial bowing sound
    decay: 0.2,       // Quick decay to set sustain level
    sustain: 0.8,     // Long sustain for steady bowing sound
    release: 1.5      // Long release to simulate bow lifting from the string
});


const synthInstruments = {
    'Bass Synth': new Synth({
        oscillators: [
            { waveform: 'square', volume: 0.5 },
            { waveform: 'sawtooth', detune: -10, volume: 0.3 },
            { waveform: 'sawtooth', detune: 10, volume: 0.3 }
        ],
        instrumentFilter: { type: 'lowpass', frequency: 200 },
        instrumentADSR: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.5 }
    }),
    'Kick Drum': new Synth({
        oscillators: [
            { waveform: 'sine', volume: 1.0 }
        ],
        instrumentFilter: { type: 'lowpass', frequency: 100 },
        instrumentADSR: { attack: 0, decay: 0.1, sustain: 0, release: 0.1 }
    }),
    'Snare Drum': new Synth({
        oscillators: [
            { waveform: 'noise', volume: 1.0 }
        ],
        instrumentFilter: { type: 'highpass', frequency: 1000 },
        instrumentADSR: { attack: 0, decay: 0.2, sustain: 0, release: 0.2 }
    }),
    'Cymbal': new Synth({
        oscillators: [
            { waveform: 'noise', volume: 1.0 }
        ],
        instrumentFilter: { type: 'highpass', frequency: 5000 },
        instrumentADSR: { attack: 0, decay: 0.5, sustain: 0, release: 0.5 }
    }),
    'Piano Synth': new Synth({
        oscillators: [
            { waveform: 'sine', detune: 0, volume: 0.5 },
            { waveform: 'sine', detune: -5, volume: 0.3 },
            { waveform: 'sine', detune: 5, volume: 0.3 }
        ],
        instrumentADSR: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.5 }
    }),
    'Default Synth': new Synth({
        oscillators: [
            { waveform: 'sine', volume: 1.0 }
        ]
    }),
    'Square Wave Synth': new Synth({
        oscillators: [
            { waveform: 'square', volume: 1.0 }
        ]
    }),
    'Sawtooth Synth': new Synth({
        oscillators: [
            { waveform: 'sawtooth', volume: 1.0 }
        ]
    }),
    'Triangle Synth': new Synth({
        oscillators: [
            { waveform: 'triangle', volume: 1.0 }
        ]
    }),
    'Smooth Synth': new Synth({
        oscillators: [
            { waveform: 'sine', volume: 1.0 }
        ],
        instrumentADSR: { attack: 0.2, decay: 0.1, sustain: 0.8, release: 1.0 }
    }),
    'Brassy Synth': new Synth({
        oscillators: [
            { waveform: 'sawtooth', volume: 1.0 }
        ],
        instrumentADSR: { attack: 0.05, decay: 0.3, sustain: 0.7, release: 0.5 }
    }),
    'Violin': violinSynth
};
