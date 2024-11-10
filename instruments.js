const synthInstruments = {
    'Sine Wave': {
        oscillators: [{ waveform: WaveformType.SINE, detune: 0, volume: 1 }],
        amplitudeEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.5 },
        filter: null, filterEnvelope: null, lfo: null, unison: null
    },
    'Square Wave': {
        oscillators: [{ waveform: WaveformType.SQUARE, detune: 0, volume: 1 }],
        amplitudeEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.5 },
        filter: null, filterEnvelope: null, lfo: null, unison: null
    },
    'Sawtooth Wave': {
        oscillators: [{ waveform: WaveformType.SAWTOOTH, detune: 0, volume: 1 }],
        amplitudeEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.5 },
        filter: null, filterEnvelope: null, lfo: null, unison: null
    },
    'Triangle Wave': {
        oscillators: [{ waveform: WaveformType.TRIANGLE, detune: 0, volume: 1 }],
        amplitudeEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.5 },
        filter: null, filterEnvelope: null, lfo: null, unison: null
    },
    'Pulse Wave': {
        oscillators: [{ waveform: WaveformType.SQUARE, detune: 0, volume: 0.5 }],
        lfo: { waveform: LFOWaveformType.SINE, frequency: 5, depth: 50, target: 'pulseWidth' },
        amplitudeEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.5 },
        filter: null, filterEnvelope: null, unison: null
    },
    'SuperSaw': {
        oscillators: [{ waveform: WaveformType.SAWTOOTH, detune: 0, volume: 1 }],
        unison: { voices: 6, detune: 15 },
        amplitudeEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.5 },
        filter: null, filterEnvelope: null, lfo: null
    },
    'White Noise': {
        oscillators: [{ waveform: WaveformType.NOISE, detune: 0, volume: 1 }],
        amplitudeEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5 },
        filter: { type: FilterType.BANDPASS, frequency: 1000, resonance: 1 },
        filterEnvelope: null, lfo: null, unison: null
    },
    'Piano': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: 0, volume: 0.6 },
            { waveform: WaveformType.TRIANGLE, detune: 0, volume: 0.3 },
            { waveform: WaveformType.TRIANGLE, detune: 2, volume: 0.2 },
            { waveform: WaveformType.SINE, detune: -1, volume: 0.15 }
        ],
        amplitudeEnvelope: { attack: 0.02, decay: 0.4, sustain: 0.6, release: 1.0 },
        filter: { type: FilterType.LOWPASS, frequency: 1500, resonance: 1.5 },
        filterEnvelope: { attack: 0.02, decay: 0.4, sustain: 1200, release: 1.5, maxFrequency: 2200 },
        lfo: { waveform: LFOWaveformType.SINE, frequency: 0.05, depth: 2, target: 'frequency' }
    },
    'Bass': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: -2400, volume: 0.6 },
            { waveform: WaveformType.TRIANGLE, detune: -2400, volume: 0.4 },
            { waveform: WaveformType.SAWTOOTH, detune: -3100, volume: 0.1 },
            { waveform: WaveformType.SAWTOOTH, detune: -1700, volume: 0.1 }
        ],
        amplitudeEnvelope: { attack: 0.005, decay: 0.2, sustain: 0.7, release: 0.3 },
        filter: { type: FilterType.LOWPASS, frequency: 700, resonance: 1.8 },
        filterEnvelope: { attack: 0.005, decay: 0.1, sustainFrequency: 700, peakFrequency: 1200, release: 0.3 },
        lfo: { waveform: LFOWaveformType.SINE, rate: 1.5, depth: 5, target: 'frequency' },
        effects: { distortion: { amount: 20 } },
        velocitySensitivity: true
    },
    'Flute': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: 0, volume: 0.6 },
            { waveform: WaveformType.TRIANGLE, detune: 0.2, volume: 0.4 },
            { waveform: WaveformType.SINE, detune: 0.5, volume: 0.2 },
            { waveform: WaveformType.NOISE, volume: 0.05 }
        ],
        amplitudeEnvelope: { attack: 0.1, decay: 0.4, sustain: 0.75, release: 1.2 },
        filter: { type: FilterType.LOWPASS, frequency: 1000, resonance: 1.0 },
        filterEnvelope: { attack: 0.08, decay: 0.3, sustain: 800, release: 1.0, maxFrequency: 1200 },
        lfo: { waveform: LFOWaveformType.SINE, frequency: 6.5, depth: 50, target: 'frequency' },
        secondaryLFO: { waveform: LFOWaveformType.SINE, frequency: 0.1, depth: 5, targets: ['volume', 'filterCutoff'] },
        noiseLFO: { waveform: LFOWaveformType.SINE, frequency: 0.3, depth: 0.05, target: 'volume' },
        reverb: { type: 'hall', decay: 3.0, mix: 0.25 }
    },
    'Kick': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: -4800, volume: 1.0 },
            { waveform: WaveformType.TRIANGLE, detune: -1700, volume: 0.8 },
            { waveform: WaveformType.NOISE, detune: -2400, volume: 0.5 }
        ],
        amplitudeEnvelope: { attack: 0.001, decay: 0.2, sustain: 0.0, release: 0.2 },
        pitchEnvelope: { attack: 0.005, decay: 0.1, sustain: 0.0, release: 0.05, startFrequency: 120, endFrequency: 40 },
        harmonicPitchEnvelope: { attack: 0.005, decay: 0.08, sustain: 0.0, release: 0.1, startFrequency: 100, endFrequency: 40 },
        noiseEnvelope: { attack: 0.001, decay: 0.03, sustain: 0.0, release: 0.03 },
        filter: { type: FilterType.BANDPASS, frequency: 120, resonance: 3.0 },
        distortion: { type: 'softclip', amount: 1.0 }
    },
    'Ambient Pad': {
        oscillators: [
            { waveform: WaveformType.SAWTOOTH, detune: -5, volume: 0.5 },
            { waveform: WaveformType.SAWTOOTH, detune: 5, volume: 0.5 }
        ],
        amplitudeEnvelope: { attack: 2, decay: 1, sustain: 0.8, release: 2 },
        filter: { type: FilterType.LOWPASS, frequency: 2000, resonance: 0.5 },
        lfo: { waveform: LFOWaveformType.SINE, frequency: 0.1, depth: 500, target: 'filter' },
        unison: { voices: 4, detune: 20 },
        filterEnvelope: null
    }
};
