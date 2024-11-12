// TODO: implement unison

const synthInstruments = {
    'Sine Wave': {
        oscillators: [{ waveform: WaveformType.SINE, detune: 0, volume: 0.3 }],
        amplitudeEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.5 },
        filter: null, filterEnvelope: null, lfo: null, unison: null
    },
    'Square Wave': {
        oscillators: [{ waveform: WaveformType.SQUARE, detune: 0, volume: 0.5 }],
        amplitudeEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.5 },
        filter: null, filterEnvelope: null, lfo: null, unison: null
    },
    'Sawtooth Wave': {
        oscillators: [{ waveform: WaveformType.SAWTOOTH, detune: 0, volume: 0.5 }],
        amplitudeEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.5 },
        filter: null, filterEnvelope: null, lfo: null, unison: null
    },
    'Triangle Wave': {
        oscillators: [{ waveform: WaveformType.TRIANGLE, detune: 0, volume: 0.5 }],
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
        oscillators: [{ waveform: WaveformType.SAWTOOTH, detune: 0, volume: 0.5 }],
        unison: { voices: 6, detune: 15 },
        amplitudeEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.5 },
        filter: null, filterEnvelope: null, lfo: null
    },
    'White Noise': {
        oscillators: [{ waveform: WaveformType.NOISE, detune: 0, volume: 1.0 }],
        amplitudeEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5 },
        filter: { type: FilterType.BANDPASS, frequency: 1000, resonance: 1 },
        filterEnvelope: null, lfo: null, unison: null
    },
    'Piano': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: 0, volume: 0.3 },
            { waveform: WaveformType.TRIANGLE, detune: 0, volume: 0.15 },
            { waveform: WaveformType.TRIANGLE, detune: 2, volume: 0.1 },
            { waveform: WaveformType.SINE, detune: -1, volume: 0.08 }
        ],
        amplitudeEnvelope: { attack: 0.02, decay: 0.4, sustain: 0.4, release: 0.6 },
        filter: { type: FilterType.LOWPASS, frequency: 1500, resonance: 1.5 },
        filterEnvelope: { attack: 0.02, decay: 0.4, sustainFrequency: 1200, release: 1.5, maxFrequency: 2200 },
        lfo: { waveform: LFOWaveformType.SINE, frequency: 0.05, depth: 2, target: 'frequency' }
    },
    'Electric Piano': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: 0, volume: 0.4 },
            { waveform: WaveformType.SQUARE, detune: 2, volume: 0.2 },
            { waveform: WaveformType.TRIANGLE, detune: -2, volume: 0.2 }
        ],
        amplitudeEnvelope: { attack: 0.03, decay: 0.5, sustain: 0.7, release: 1.2 },
        filter: { type: FilterType.LOWPASS, frequency: 1200, resonance: 1.3 },
        filterEnvelope: { attack: 0.03, decay: 0.5, sustainFrequency: 1200, release: 1.2, maxFrequency: 2500 },
        lfo: { waveform: LFOWaveformType.SINE, frequency: 0.2, depth: 100, target: 'filter.frequency' },
        unison: { voices: 3, detune: 10 }
    },
    'Bitcrusher Piano': {
        oscillators: [
            { waveform: WaveformType.SAWTOOTH, detune: 0, volume: 0.25 },
            { waveform: WaveformType.SQUARE, detune: 0, volume: 0.15 },
            { waveform: WaveformType.TRIANGLE, detune: 0, volume: 0.1 }
        ],
        amplitudeEnvelope: { attack: 0.02, decay: 0.4, sustain: 0.6, release: 1.0 },
        filter: { type: FilterType.LOWPASS, frequency: 1800, resonance: 1.2 },
        filterEnvelope: { attack: 0.02, decay: 0.4, sustainFrequency: 1800, peakFrequency: 2500, release: 1.0 },
        lfo: { waveform: LFOWaveformType.SINE, frequency: 0.05, depth: 100, target: 'filter.frequency' },
        bitcrusher: { bits: 8, sampleRate: 22050 },
        reverb: { type: 'smallRoom', decay: 1.5, mix: 0.3 },
        unison: null
    },
    'Chime': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: 1200, volume: 0.3 },
            { waveform: WaveformType.TRIANGLE, detune: 1205, volume: 0.2 },
            { waveform: WaveformType.TRIANGLE, detune: 1195, volume: 0.2 },
            { waveform: WaveformType.SAWTOOTH, detune: 1210, volume: 0.1 }
        ],
        amplitudeEnvelope: { attack: 0.005, decay: 0.3, sustain: 0.5, release: 1.5 },
        filter: { type: FilterType.BANDPASS, frequency: 1000, resonance: 2.5 },
        filterEnvelope: { attack: 0.005, decay: 0.3, sustainFrequency: 1000, peakFrequency: 2000, release: 1.5 },
        lfo: { waveform: LFOWaveformType.SINE, frequency: 0.1, depth: 300, target: 'filter.frequency' },
        reverb: { type: 'plate', decay: 2.5, mix: 0.4 },
        unison: { voices: 4, detune: 15 }
    },
    'Blip': {
        oscillators: [
//            { waveform: WaveformType.NOISE, detune: 0, volume: 0.7 },
            { waveform: WaveformType.SINE, detune: 0, volume: 0.3 }
        ],
        amplitudeEnvelope: { attack: 0.001, decay: 0.2, sustain: 0.0, release: 0.1 },
        filter: { type: FilterType.HIGHPASS, frequency: 2000, resonance: 1.0 },
        filterEnvelope: { attack: 0.0, decay: 0.1, sustainFrequency: 2000, release: 0.1, maxFrequency: 3000 },
        lfo: null,
        distortion: { type: 'softclip', amount: 0.3 },
        reverb: { type: 'room', decay: 1.5, mix: 0.2 },
    },
    'Kick': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: -4800, volume: 0.8 },
            { waveform: WaveformType.SINE, detune: -2400, volume: 0.8 },
            { waveform: WaveformType.TRIANGLE, detune: -1700, volume: 0.3 },
    //            { waveform: WaveformType.NOISE, detune: -2400, volume: 1 }
        ],
        amplitudeEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.05, release: 0.3 },
        //pitchEnvelope: { attack: 0.005, decay: 0.1, sustain: 0.0, release: 0.05, startFrequency: 120, endFrequency: 40 },
        //harmonicPitchEnvelope: { attack: 0.005, decay: 0.08, sustain: 0.0, release: 0.1, startFrequency: 100, endFrequency: 40 },
        //noiseEnvelope: { attack: 0.001, decay: 0.03, sustain: 0.0, release: 0.03 },
        filter: { type: FilterType.BANDPASS, frequency: 180, resonance: 0.05 },
        distortion: { type: 'softclip', amount: 1.0 },
        velocitySensitivity: false
    },
    'Bass': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: -2400, volume: 0.5 },
            { waveform: WaveformType.TRIANGLE, detune: -2400, volume: 0.3 }
        ],
        amplitudeEnvelope: { attack: 0.05, decay: 0.3, sustain: 0.6, release: 0.4 },
        filter: { type: FilterType.LOWPASS, frequency: 600, resonance: 1.5 },
        filterEnvelope: { attack: 0.05, decay: 0.3, sustainFrequency: 600, peakFrequency: 1800, release: 0.4 },
        lfo: { waveform: LFOWaveformType.SINE, frequency: 1, depth: 150, target: 'filter.frequency' },
        distortion: { type: 'tube', amount: 0.3 },
        unison: { voices: 4, detune: 20 }
    },
    'Glitch Bass': {
        oscillators: [
            { waveform: WaveformType.SQUARE, detune: -2400, volume: 0.6 },
            { waveform: WaveformType.NOISE, detune: -2400, volume: 0.1 }
        ],
        amplitudeEnvelope: { attack: 0.02, decay: 0.15, sustain: 0.4, release: 0.2 },
        filter: { type: FilterType.BANDPASS, frequency: 800, resonance: 2.0 },
        filterEnvelope: { attack: 0.02, decay: 0.15, sustainFrequency: 800, peakFrequency: 1200, release: 0.2 },
        lfo: { waveform: LFOWaveformType.SQUARE, frequency: 4, depth: 300, target: 'filter.frequency' },
        distortion: { type: 'bitcrush', amount: 0.7 },
        unison: { voices: 2, detune: 20 }
    },
    'FM Bass': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: -2400, volume: 0.5, modulationIndex: 2, frequencyMultiplier: 1 },
            { waveform: WaveformType.SINE, detune: -2400, volume: 0.3, frequencyMultiplier: 2 }
        ],
        amplitudeEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.3 },
        filter: { type: FilterType.HIGHPASS, frequency: 500, resonance: 1.0 },
        filterEnvelope: { attack: 0.01, decay: 0.2, sustainFrequency: 500, peakFrequency: 1500, release: 0.3 },
        lfo: { waveform: LFOWaveformType.TRIANGLE, frequency: 2, depth: 200, target: 'filter.frequency' },
        distortion: { type: 'overdrive', amount: 0.4 },
        unison: null
    },
    'Deep Bass': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: -2400, volume: 0.4 },
            { waveform: WaveformType.TRIANGLE, detune: -2400, volume: 0.2 },
            { waveform: WaveformType.SAWTOOTH, detune: -3100, volume: 0.1 },
            { waveform: WaveformType.SAWTOOTH, detune: -1700, volume: 0.1 }
        ],
        amplitudeEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.5, release: 0.3 },
        filter: { type: FilterType.LOWPASS, frequency: 700, resonance: 1.8 },
        filterEnvelope: { attack: 0.05, decay: 0.1, sustainFrequency: 700, peakFrequency: 1200, release: 0.3 },
        lfo: { waveform: LFOWaveformType.SINE, rate: 0.5, depth: 8, target: 'frequency' },
        velocitySensitivity: false
    },
    'Granular Synth': {
        oscillators: [
            { waveform: WaveformType.NOISE, detune: 0, volume: 0.2 },
            { waveform: WaveformType.SAWTOOTH, detune: 0, volume: 0.3 }
        ],
        amplitudeEnvelope: { attack: 0.1, decay: 0.3, sustain: 0.7, release: 1.0 },
        filter: { type: FilterType.HIGHPASS, frequency: 1000, resonance: 1.5 },
        filterEnvelope: { attack: 0.1, decay: 0.3, sustainFrequency: 1000, peakFrequency: 2000, release: 1.0 },
        granular: { grainSize: 0.05, overlap: 0.5, density: 1.5 },
        lfo: { waveform: LFOWaveformType.TRIANGLE, frequency: 0.2, depth: 500, target: 'granular.density' },
        reverb: { type: 'darkHall', decay: 3.5, mix: 0.5 },
        unison: { voices: 3, detune: 25 }
    },     'Brass': {
        oscillators: [
            { waveform: WaveformType.TRIANGLE, detune: -100, volume: 0.6 }, // Fundamental tone
            { waveform: WaveformType.TRIANGLE, detune: 100, volume: 0.5 },  // Slight detune for richness
            { waveform: WaveformType.NOISE, detune: 0, volume: 0.2 }        // Breath noise
        ],
        amplitudeEnvelope: { 
            attack: 0.05,    // Slightly slower attack for a natural onset
            decay: 0.2,      // Moderate decay
            sustain: 0.7,    // Higher sustain for longer notes
            release: 0.3     // Controlled release
        },
        filters: [
            { 
                type: FilterType.LOWPASS, 
                frequency: 800, 
                resonance: 1.2,
                envelope: { 
                    attack: 0.05, 
                    decay: 0.1, 
                    sustain: 0.8, 
                    release: 0.2 
                }
            },
            { 
                type: FilterType.BANDPASS, 
                frequency: 600, 
                resonance: 1.0,
                envelope: { 
                    attack: 0.03, 
                    decay: 0.05, 
                    sustain: 0.6, 
                    release: 0.2 
                }
            }
        ],
        distortion: { 
            type: 'softclip', 
            amount: 0.5    // Mild distortion to add warmth without harshness
        },
        velocitySensitivity: true    // Allows expressive playing based on velocity
    },
    'WobbleWobble': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: 0, volume: 0.6 },
            { waveform: WaveformType.TRIANGLE, detune: 0.2, volume: 0.4 },
            { waveform: WaveformType.SINE, detune: 0.5, volume: 0.2 },
            { waveform: WaveformType.NOISE, volume: 0.05 }
        ],
        //pitchEnvelope: { attack: 0.005, decay: 0.1, sustain: 0.0, release: 0.05, startFrequency: 120, endFrequency: 40 },
        //harmonicPitchEnvelope: { attack: 0.005, decay: 0.08, sustain: 0.0, release: 0.1, sustainFrequency: 800, releaseFrequency: 1200 },
        lfo: { waveform: LFOWaveformType.SINE, frequency: 6.5, depth: 50, target: 'frequency' },
        secondaryLFO: { waveform: LFOWaveformType.SINE, frequency: 0.1, depth: 5, targets: ['volume', 'filterCutoff'] },
        noiseLFO: { waveform: LFOWaveformType.SINE, frequency: 0.3, depth: 0.05, target: 'volume' },
        reverb: { type: 'hall', decay: 3.0, mix: 0.25 }
    },
    'Vibrato Pad': {
        oscillators: [
            { waveform: WaveformType.TRIANGLE, detune: 0, volume: 0.4 },
            { waveform: WaveformType.SINE, detune: 0, volume: 0.3 },
            { waveform: WaveformType.NOISE, detune: 0, volume: 0.1 }
        ],
        amplitudeEnvelope: { attack: 1.0, decay: 0.5, sustain: 0.8, release: 2.0 },
        filter: { type: FilterType.LOWPASS, frequency: 1500, resonance: 1.0 },
        filterEnvelope: { attack: 1.0, decay: 0.5, sustainFrequency: 1500, peakFrequency: 2500, release: 2.0 },
        lfo: { waveform: LFOWaveformType.SINE, frequency: 5, depth: 300, target: 'filter.frequency' },
        vibrato: { rate: 6, depth: 0.05 },
        reverb: { type: 'space', decay: 4.0, mix: 0.3 },
        unison: { voices: 2, detune: 10 }
    },
    'Ambient Pad': {
        oscillators: [
            { waveform: WaveformType.SAWTOOTH, detune: -5, volume: 0.2 },
            { waveform: WaveformType.SAWTOOTH, detune: 5, volume: 0.2 }
        ],
        amplitudeEnvelope: { attack: 0.5, decay: 1, sustain: 0.8, release: 2 },
        filter: { type: FilterType.LOWPASS, frequency: 2000, resonance: 1.5 },
        lfo: { waveform: LFOWaveformType.SINE, frequency: 100, depth: 500, target: 'filter' },
        filterEnvelope: null
    },
};
