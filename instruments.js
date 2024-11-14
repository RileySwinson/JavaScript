// TODO: implement unison

const synthInstruments = {
    'Sawtooth Wave': {
        oscillators: [{ waveform: WaveformType.SAWTOOTH, detune: 0, volume: 0.5 }],
        amplitudeEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.5 },
        filter: null, filterEnvelope: null, lfo: null, unison: null
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
    'Kick': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: -3600, volume: 0.8 },
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
            { waveform: WaveformType.SINE, detune: -2400, volume: 0.6 },
            { waveform: WaveformType.TRIANGLE, detune: -1205, volume: 0.3 }
        ],
        amplitudeEnvelope: { attack: 0.05, decay: 0.3, sustain: 0.3, release: 0.7 },
        //filter: { type: FilterType.LOWPASS, frequency: 1200, resonance: 1.0 },
        //filterEnvelope: { attack: 0.05, decay: 0.3, sustainFrequency: 800, peakFrequency: 1800, release: 0.4 },
       // lfo: { waveform: LFOWaveformType.SINE, frequency: 400, depth: 150, target: 'filter.frequency' },
        distortion: { type: 'tube', amount: 0.2 },
    },
    'Glitch Bass': {
        oscillators: [
            { waveform: WaveformType.SQUARE, detune: -1200, volume: 0.6 },
            { waveform: WaveformType.NOISE, detune: -1200, volume: 0.1 }
        ],
        amplitudeEnvelope: { attack: 0.02, decay: 0.15, sustain: 0.4, release: 0.2 },
        filter: { type: FilterType.BANDPASS, frequency: 800, resonance: 2.0 },
        filterEnvelope: { attack: 0.02, decay: 0.15, sustainFrequency: 800, peakFrequency: 1200, release: 0.2 },
        lfo: { waveform: LFOWaveformType.SQUARE, frequency: 4, depth: 300, target: 'filter.frequency' },
        distortion: { type: 'bitcrush', amount: 0.7 },
        unison: { voices: 2, detune: 20 }
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
    'Wobble': {
        oscillators: [
            { waveform: WaveformType.SINE, detune: 0, volume: 0.3 },
            { waveform: WaveformType.TRIANGLE, detune: 2, volume: 0.2 },
            { waveform: WaveformType.SINE, detune: 5, volume: 0.1 },
        ],
        //pitchEnvelope: { attack: 0.005, decay: 0.1, sustain: 0.0, release: 0.05, startFrequency: 120, endFrequency: 40 },
        //harmonicPitchEnvelope: { attack: 0.005, decay: 0.08, sustain: 0.0, release: 0.1, sustainFrequency: 800, releaseFrequency: 1200 },
        lfo: { waveform: LFOWaveformType.SINE, frequency: 6.5, depth: 50, target: 'frequency' },
        secondaryLFO: { waveform: LFOWaveformType.SINE, frequency: 0.1, depth: 5, targets: ['volume', 'filterCutoff'] },
        noiseLFO: { waveform: LFOWaveformType.SINE, frequency: 0.3, depth: 0.05, target: 'volume' },
        reverb: { type: 'hall', decay: 3.0, mix: 0.25 }
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
