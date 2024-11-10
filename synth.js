// Define Waveform Types as Enum
const WaveformType = Object.freeze({
    SINE: 'sine',
    SQUARE: 'square',
    SAWTOOTH: 'sawtooth',
    TRIANGLE: 'triangle',
    NOISE: 'noise'
});

class Synth {
    constructor({
        oscillators = [{ waveform: WaveformType.SINE, detune: 0, volume: 0.5 }],
        filter = null,
        attack = 0.01,
        decay = 0.1,
        sustain = 0.7,
        release = 0.5
    } = {}) {
        this.oscillators = oscillators;
        this.filter = filter;
        this.attack = attack;
        this.decay = decay;
        this.sustain = sustain;
        this.release = release;

        // Use a shared AudioContext among all Synth instances
        if (!Synth.audioContext) {
            Synth.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    play(frequency, masterVolume = 1.0, duration = 1, outputNode = null) {
        const audioContext = Synth.audioContext;
    
        // Main gain node to control overall volume and apply envelope
        const mainGainNode = audioContext.createGain();
        const currentTime = audioContext.currentTime;
        const attackEndTime = currentTime + this.attack;
        const decayEndTime = attackEndTime + this.decay;
        const releaseStartTime = currentTime + duration;
    
        mainGainNode.gain.setValueAtTime(0, currentTime);
        mainGainNode.gain.linearRampToValueAtTime(masterVolume, attackEndTime); // Attack
        mainGainNode.gain.linearRampToValueAtTime(masterVolume * this.sustain, decayEndTime); // Decay
        mainGainNode.gain.setValueAtTime(masterVolume * this.sustain, releaseStartTime); // Sustain
        mainGainNode.gain.linearRampToValueAtTime(0, releaseStartTime + this.release); // Release
    
        let finalNode = mainGainNode;
    
        // Apply filter if specified
        if (this.filter) {
            const filterNode = audioContext.createBiquadFilter();
            filterNode.type = this.filter.type;
            filterNode.frequency.setValueAtTime(this.filter.frequency, currentTime);
            mainGainNode.connect(filterNode);
            finalNode = filterNode;
        }
    
        // Connect the final node to the outputNode or destination
        if (outputNode) {
            finalNode.connect(outputNode);
        } else {
            finalNode.connect(audioContext.destination);
        }
    
        // Create and connect each oscillator with its own gain for individual volume control
        this.oscillators.forEach(oscConfig => {
            const oscGainNode = audioContext.createGain();
            oscGainNode.gain.value = oscConfig.volume || 0.5; // Default volume for each oscillator
    
            if (oscConfig.waveform === WaveformType.NOISE) {
                // Create noise buffer
                const bufferSize = audioContext.sampleRate * (duration + this.release);
                const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
                const output = noiseBuffer.getChannelData(0);
    
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
    
                const noiseSource = audioContext.createBufferSource();
                noiseSource.buffer = noiseBuffer;
                noiseSource.loop = false;
    
                noiseSource.connect(oscGainNode);
                oscGainNode.connect(mainGainNode);
                noiseSource.start(currentTime);
                noiseSource.stop(releaseStartTime + this.release);
            } else {
                const oscillator = audioContext.createOscillator();
                oscillator.type = oscConfig.waveform;
                oscillator.frequency.setValueAtTime(frequency, currentTime);
                oscillator.detune.setValueAtTime(oscConfig.detune || 0, currentTime);
    
                oscillator.connect(oscGainNode);
                oscGainNode.connect(mainGainNode);
                oscillator.start(currentTime);
                oscillator.stop(releaseStartTime + this.release);
            }
        });
    }
}
