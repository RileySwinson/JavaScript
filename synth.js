// Define Waveform Types as Enum
const WaveformType = Object.freeze({
    SINE: 'sine',
    SQUARE: 'square',
    SAWTOOTH: 'sawtooth',
    TRIANGLE: 'triangle',
    NOISE: 'noise',
  });
  
  // Define Filter Types as Enum
  const FilterType = Object.freeze({
    LOWPASS: 'lowpass',
    HIGHPASS: 'highpass',
    BANDPASS: 'bandpass',
  });
  
  // Define LFO Waveform Types as Enum
  const LFOWaveformType = Object.freeze({
    SINE: 'sine',    // Helper function to create distortion curve

    SQUARE: 'square',
    SAWTOOTH: 'sawtooth',
    TRIANGLE: 'triangle',
  });
  
  class Synth {
    constructor({
      oscillators = [{ waveform: WaveformType.SINE, detune: 0, volume: 0.5 }],
      filter = null,
      amplitudeEnvelope = { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.5 },
      filterEnvelope = null,
      lfo = null,
      effects = null,
      velocitySensitivity = false
    } = {}) {
      this.oscillators = oscillators;
      this.filter = filter;
      this.amplitudeEnvelope = amplitudeEnvelope;
      this.filterEnvelope = filterEnvelope;
      this.lfo = lfo;
      this.effects = effects;
      this.velocitySensitivity = velocitySensitivity;
      
      // Use a shared AudioContext among all Synth instances
      if (!Synth.audioContext) {
        Synth.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
    }
  
    play(frequency, masterVolume = 1.0, duration = 1, outputNode = null, velocity = 1.0) {
      const audioContext = Synth.audioContext;
      frequency = isFinite(frequency) ? frequency : 440;
  
      // Main gain node to control overall volume and apply envelope
      const mainGainNode = audioContext.createGain();
      const currentTime = audioContext.currentTime;
  
      // Apply velocity sensitivity to amplitude
      if (this.velocitySensitivity) {
        masterVolume *= velocity;
      }
  
      // Calculate envelope times
      const attackEndTime = currentTime + this.amplitudeEnvelope.attack;
      const decayEndTime = attackEndTime + this.amplitudeEnvelope.decay;
      const releaseStartTime = currentTime + duration;
  
      // Set up amplitude envelope
      mainGainNode.gain.setValueAtTime(0, currentTime);
      mainGainNode.gain.linearRampToValueAtTime(
          isFinite(masterVolume) ? masterVolume : 1.0,
          attackEndTime
      ); // Attack
      mainGainNode.gain.linearRampToValueAtTime(
          isFinite(masterVolume * this.amplitudeEnvelope.sustain) ? masterVolume * this.amplitudeEnvelope.sustain : 0.7,
          decayEndTime
      ); // Decay
      mainGainNode.gain.setValueAtTime(
          isFinite(masterVolume * this.amplitudeEnvelope.sustain) ? masterVolume * this.amplitudeEnvelope.sustain : 0.7,
          releaseStartTime
      ); // Sustain
      mainGainNode.gain.linearRampToValueAtTime(0, releaseStartTime + this.amplitudeEnvelope.release); // Release  
      
      let finalNode = mainGainNode;
  
      // Apply filter if specified
      let filterNode;
      if (this.filter) {
        filterNode = audioContext.createBiquadFilter();
        filterNode.type = this.filter.type;
        filterNode.frequency.setValueAtTime(this.filter.frequency || 1000, currentTime);
        if (this.filter.resonance !== undefined) {
          filterNode.Q.value = this.filter.resonance;
        }
        mainGainNode.connect(filterNode);
        finalNode = filterNode;
      }
  
      if (this.effects) {
        // Distortion/Saturation
        if (this.effects.distortion) {
          const distortionNode = audioContext.createWaveShaper();
          distortionNode.curve = this.makeDistortionCurve(this.effects.distortion.amount);
          distortionNode.oversample = '4x';
          finalNode.connect(distortionNode);
          finalNode = distortionNode;
        }
  
        // chorous and reverb placeholders
        if (this.effects.chorus) {
        }
  
        if (this.effects.reverb) {
          const convolver = audioContext.createConvolver();
   
          finalNode.connect(convolver);
          finalNode = convolver;
        }
      }
  
      // Connect the final node to the outputNode or destination
      if (outputNode) {
        finalNode.connect(outputNode);
      } else {
        finalNode.connect(audioContext.destination);
      }
  
      // Create and connect each oscillator
      this.oscillators.forEach((oscConfig) => {
        const oscGainNode = audioContext.createGain();
        oscGainNode.gain.value = oscConfig.volume || 0.5;
  
        if (oscConfig.waveform === WaveformType.NOISE) {
          // TODO: Implement noise oscilator
        } else {
          const oscillator = audioContext.createOscillator();
          oscillator.type = oscConfig.waveform;
          oscillator.frequency.setValueAtTime(frequency, currentTime);
          const detuneAmount = oscConfig.detune || 0;
          oscillator.detune.setValueAtTime(detuneAmount, currentTime);
  
          // Apply LFO for vibrato
          if (this.lfo && this.lfo.target === 'frequency') {
            const lfoOscillator = audioContext.createOscillator();
            lfoOscillator.type = this.lfo.waveform || LFOWaveformType.SINE;
            lfoOscillator.frequency.setValueAtTime(this.lfo.rate || 5, currentTime);
  
            const lfoGain = audioContext.createGain();
            lfoGain.gain.setValueAtTime(this.lfo.depth || 5, currentTime);
  
            lfoOscillator.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            lfoOscillator.start(currentTime);
            lfoOscillator.stop(releaseStartTime + this.amplitudeEnvelope.release);
          }
  
          oscillator.connect(oscGainNode);
          oscGainNode.connect(mainGainNode);
          oscillator.start(currentTime);
          oscillator.stop(releaseStartTime + this.amplitudeEnvelope.release);
        }
      });
  
      if (this.filterEnvelope && filterNode) {
        const filterAttackEndTime = currentTime + (this.filterEnvelope.attack || 0);
        const filterDecayEndTime = filterAttackEndTime + (this.filterEnvelope.decay || 0);
        const filterReleaseStartTime = currentTime + duration;
    
        filterNode.frequency.setValueAtTime(
            isFinite(this.filterEnvelope.startFrequency) ? this.filterEnvelope.startFrequency : (this.filter.frequency || 1000),
            currentTime
        );
        filterNode.frequency.linearRampToValueAtTime(
            isFinite(this.filterEnvelope.peakFrequency) ? this.filterEnvelope.peakFrequency : 1500,
            filterAttackEndTime
        ); // Attack
        filterNode.frequency.linearRampToValueAtTime(
            isFinite(this.filterEnvelope.sustainFrequency) ? this.filterEnvelope.sustainFrequency : 1200,
            filterDecayEndTime
        ); // Decay
        filterNode.frequency.setValueAtTime(
            isFinite(this.filterEnvelope.sustainFrequency) ? this.filterEnvelope.sustainFrequency : 1200,
            filterReleaseStartTime
        ); // Sustain
        filterNode.frequency.linearRampToValueAtTime(
            isFinite(this.filterEnvelope.endFrequency) ? this.filterEnvelope.endFrequency : (this.filter.frequency || 1000),
            filterReleaseStartTime + (this.filterEnvelope.release || 0.3)
        ); // Release
    }

      // Global gain
      const scaleGainNode = audioContext.createGain();
      scaleGainNode.gain.value = 0.4; 

      // Connect the final node to the scaling node, then to the destination
      finalNode.connect(scaleGainNode);
      if (outputNode) {
          scaleGainNode.connect(outputNode);
      } else {
          scaleGainNode.connect(audioContext.destination);
      }
    }
  
    makeDistortionCurve(amount) {
      const k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180;
      let i = 0,
        x;
      for (; i < n_samples; ++i) {
        x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
      return curve;
    }
  }
  