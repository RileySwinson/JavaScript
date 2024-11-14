let globalRhythmicOffset = 0;

// Unique identifier for sliders to prevent ID conflicts
let sliderIdCounter = 0;

// Global Offset Slider Event Listener
document.getElementById('global-offset-slider').addEventListener('input', function () {
    globalRhythmicOffset = parseFloat(this.value);
    document.getElementById('global-offset-value').innerText = this.value;

    // Reschedule updates for each running GameOfLife instance
    document.querySelectorAll('.container').forEach(container => {
        const gameInstance = container.gameInstance;
        if (gameInstance && gameInstance.isRunning) {
            gameInstance.rescheduleUpdates();
        }
    });
});

// Shared AudioContext among all Synth instances
if (!Synth.audioContext) {
    Synth.audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// Populate the "Select Synth" dropdown
const synthSelect = document.getElementById('synth-select');
for (let synthName in synthInstruments) {
    let option = document.createElement('option');
    option.value = synthName;
    option.text = synthName;
    synthSelect.appendChild(option);
}

// GameOfLife Class Definition
class GameOfLife {
    constructor(rows, cols, canvas, counterElements, key, scale, container, controls, tet, synth) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createGrid();
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.cellWidth = this.canvas.width / this.cols;
        this.cellHeight = this.canvas.height / this.rows;
        this.counterElements = counterElements;
        this.key = key;
        this.scale = scale;
        this.container = container;
        this.container.gameInstance = this;
        this.previousGrid = this.createGrid();
        this.isRunning = false; 
        this.controls = controls;   
        this.tet = tet;
        this.synth = new Synth(synth);

        this.audioContext = Synth.audioContext;
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = parseFloat(this.controls.volumeSlider.value);
        this.gainNode.connect(this.audioContext.destination);

        // Volume Slider Event Listener
        this.controls.volumeSlider.addEventListener('input', () => {
            this.gainNode.gain.value = parseFloat(this.controls.volumeSlider.value);
            this.controls.volumeValue.innerText = this.controls.volumeSlider.value;
        });

        // Canvas Click Event Listener
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));

        // Reschedule Updates on Speed or Offset Change
        const rescheduleUpdates = () => {
            if (this.isRunning) {
                clearTimeout(this.timeout);
                this.start(); 
            }
        };

        this.controls.updateSpeedSlider.addEventListener('input', rescheduleUpdates);
        this.controls.rhythmicOffsetSlider.addEventListener('input', rescheduleUpdates);

        // Initialize Repetitions
        this.numRepetitions = parseInt(this.controls.repetitionsSelect.value) || 1;
        this.currentRepetition = 0;

        this.controls.repetitionsSelect.addEventListener('change', () => {
            this.numRepetitions = parseInt(this.controls.repetitionsSelect.value) || 1;
        });

        // Initialize Volume Value Display
        this.controls.volumeValue.innerText = this.controls.volumeSlider.value;

        this.renderGrid();
    }

    createGrid() {
        let grid = new Array(this.rows);
        
        for (let i = 0; i < this.rows; i++) {
            grid[i] = new Array(this.cols).fill(0);
        }

        return grid;
    }

    randomizeGrid() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.grid[i][j] = Math.floor(Math.random() * 2);
            }
        }

        this.renderGrid();
    }

    renderGrid() {
        this.cellWidth = this.canvas.width / this.cols;
        this.cellHeight = this.canvas.height / this.rows;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let currentState = this.grid[i][j];
                let previousState = this.previousGrid[i][j];

                if (currentState === 1) {
                    this.context.fillStyle = previousState === 0 ? '#00ff00' : '#000000';
                } else {
                    this.context.fillStyle = previousState === 1 ? '#ff0000' : '#ffffff';
                }

                this.context.fillRect(j * this.cellWidth, i * this.cellHeight, this.cellWidth, this.cellHeight);
                this.context.strokeStyle = '#ccc';
                this.context.strokeRect(j * this.cellWidth, i * this.cellHeight, this.cellWidth, this.cellHeight);
            }
        }
    }

    updateGrid() {
        this.currentRepetition++;
    
        const isStateBasedMode = this.controls.soundModeToggle.checked;
        const selectedMode = this.controls.musicGenSelect.value;

        if (this.currentRepetition < this.numRepetitions) {
            if (isStateBasedMode) {
                this.generateSound();
            } else {
                this.generateSound(selectedMode);
            }
            return;
        } else {
            this.currentRepetition = 0;
        }
    
        let newGrid = this.createGrid();
    
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let liveNeighbors = this.countLiveNeighbors(i, j);
                let currentState = this.grid[i][j];
                let newState;

                if (currentState === 1) {
                    newState = (liveNeighbors < 2 || liveNeighbors > 3) ? 0 : 1;
                } else {
                    newState = (liveNeighbors === 3) ? 1 : 0;
                }

                newGrid[i][j] = newState;
            }
        }
    
        this.previousGrid = JSON.parse(JSON.stringify(this.grid));
        this.grid = newGrid;
        this.renderGrid();
    
        const aliveCount = this.countAliveCells();
        const newbornCount = this.countNewbornCells();
        const newlyDeadCount = this.countNewlyDeadCells();
    
        this.counterElements.alive.innerText = `Alive: ${aliveCount}`;
        this.counterElements.newborn.innerText = `Newborn: ${newbornCount}`;
        this.counterElements.newlyDead.innerText = `Died: ${newlyDeadCount}`;
    
        if (isStateBasedMode) {
            this.generateSound();
        } else {
            this.generateSound(selectedMode);
        }
    }

    countLiveNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                let wrappedRow = (row + i + this.rows) % this.rows;
                let wrappedCol = (col + j + this.cols) % this.cols;
                count += this.grid[wrappedRow][wrappedCol];
            }
        }
        return count;
    }

    handleCanvasClick(event) {
        if (this.isRunning) return;
        let rect = this.canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        let col = Math.floor(x / this.cellWidth);
        let row = Math.floor(y / this.cellHeight);
        this.grid[row][col] = this.grid[row][col] ? 0 : 1;
        this.renderGrid();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
    
        const scheduleNextUpdate = () => {
            //const baseTempo = parseInt(document.getElementById('tempo-slider').value);
            const baseTempo = 120;
            const speedMultiplier = parseFloat(this.controls.updateSpeedSlider.value);
            const interval = (60000 / baseTempo) * (1 / speedMultiplier);
    
            // Calculate the combined rhythmic offset: individual + global
            const individualOffsetBeats = parseFloat(this.controls.rhythmicOffsetSlider.value);
            const globalOffsetBeats = parseFloat(document.getElementById('global-offset-slider').value);
            const totalOffsetBeats = individualOffsetBeats + globalOffsetBeats;
            const totalOffsetMs = totalOffsetBeats * interval;
    
            // Calculate the exact delay until the next update
            const now = Date.now();
            const timeSinceLastUpdate = now % interval;
            let timeUntilNextUpdate = interval - timeSinceLastUpdate + totalOffsetMs;
    
            // Adjust the timing if it overflows the interval
            if (timeUntilNextUpdate >= interval) {
                timeUntilNextUpdate -= interval;
            }
            if (timeUntilNextUpdate < 0) {
                timeUntilNextUpdate += interval;
            }
    
            // Recursively schedule updates
            this.timeout = setTimeout(() => {
                this.updateGrid();
    
                if (this.isRunning) {
                    scheduleNextUpdate();
                }
            }, timeUntilNextUpdate);
        };
    
        scheduleNextUpdate();
    
        // Define a function to reschedule updates whenever speed or offset changes
        const rescheduleUpdates = () => {
            if (this.isRunning) {
                clearTimeout(this.timeout);
                scheduleNextUpdate();
            }
        };
    
        // Add listeners for changes in update speed, individual rhythmic offset, and global offset
        this.controls.updateSpeedSlider.addEventListener('input', rescheduleUpdates);
        this.controls.rhythmicOffsetSlider.addEventListener('input', rescheduleUpdates);
        document.getElementById('global-offset-slider').addEventListener('input', rescheduleUpdates);
    }

    stop() {
        this.isRunning = false;
        clearTimeout(this.timeout);
    }
    
    generateSound(mode) {
        const isStateBasedMode = this.controls.soundModeToggle.checked;
        const volume = parseFloat(this.controls.volumeSlider.value) || 0.5;
        const scaleFrequencies = frequencies.getFrequencies(this.tet, this.key, this.scale);
        let playedFrequencies = [];

        if (isStateBasedMode) {
            const aliveCount = this.countAliveCells();
            const newbornCount = this.countNewbornCells();
            const newlyDeadCount = this.countNewlyDeadCells();

            const getFrequency = (count, octaveShift) => {
                const scaleLength = scaleFrequencies.length;
                if (scaleLength === 0) return null;
                const scaleRepeats = Math.floor(count / scaleLength);
                const noteIndex = count % scaleLength;
                return scaleFrequencies[noteIndex] * Math.pow(2, scaleRepeats + octaveShift);
            };

            if (this.controls.aliveCheckbox.checked && aliveCount > 0) {
                const freq = getFrequency(aliveCount, -2);
                if (freq) {
                    this.synth.play(freq, volume, 0.5);
                    playedFrequencies.push(freq);
                }
            }
            if (this.controls.newlyDeadCheckbox.checked && newlyDeadCount > 0) {
                const freq = getFrequency(newlyDeadCount, -2);
                if (freq) {
                    this.synth.play(freq, volume, 0.5);
                    playedFrequencies.push(freq);
                }
            }
            if (this.controls.newbornCheckbox.checked && newbornCount > 0) {
                const freq = getFrequency(newbornCount, 0);
                if (freq) {
                    this.synth.play(freq, volume, 0.5);
                    playedFrequencies.push(freq);
                }
            }
        } else if (mode) { // Ensure mode is provided
            let notesToPlay = [];
            const centerRow = Math.floor(this.rows / 2);

            const calculateFrequency = (row) => {
                const relativeRow = centerRow - row;
                const notesPerOctave = scaleFrequencies.length;
                const octaveShift = Math.floor(relativeRow / notesPerOctave);
                const noteIndex = ((relativeRow % notesPerOctave) + notesPerOctave) % notesPerOctave;
                const frequency = scaleFrequencies[noteIndex] * Math.pow(2, octaveShift);
                return frequency;
            };

            switch (mode) {
                case 'all-alive':
                    for (let row = 0; row < this.rows; row++) {
                        for (let col = 0; col < this.cols; col++) {
                            if (this.grid[row][col] === 1) {
                                const freq = calculateFrequency(row);
                                notesToPlay.push(freq);
                                playedFrequencies.push(freq);
                            }
                        }
                    }
                    break;
                case 'born-cells':
                    for (let row = 0; row < this.rows; row++) {
                        for (let col = 0; col < this.cols; col++) {
                            if (this.grid[row][col] === 1 && this.previousGrid[row][col] === 0) {
                                const freq = calculateFrequency(row);
                                notesToPlay.push(freq);
                                playedFrequencies.push(freq);
                            }
                        }
                    }
                    break;
                case 'rightmost-alive':
                    for (let col = 0; col < this.cols; col++) {
                        for (let row = this.rows - 1; row >= 0; row--) {
                            if (this.grid[row][col] === 1) {
                                const freq = calculateFrequency(row);
                                notesToPlay.push(freq);
                                playedFrequencies.push(freq);
                                break;
                            }
                        }
                    }
                    break;
                case 'rightmost-born':
                    for (let col = 0; col < this.cols; col++) {
                        for (let row = this.rows - 1; row >= 0; row--) {
                            if (this.grid[row][col] === 1 && this.previousGrid[row][col] === 0) {
                                const freq = calculateFrequency(row);
                                notesToPlay.push(freq);
                                playedFrequencies.push(freq);
                                break;
                            }
                        }
                    }
                    break;
                default:
                    console.warn(`Unknown sound mode: ${mode}`);
            }

            notesToPlay.forEach(frequency => this.synth.play(frequency, 1.0, 0.5, this.gainNode));
        } else {
            console.warn('Sound mode not specified or invalid.');
        }

        // Log the frequencies to the console
        if (playedFrequencies.length > 0) {
            console.log(`Automaton Frequencies: ${playedFrequencies.join(', ')}`);
        }
    }

    countAliveCells() {
        return this.grid.flat().filter(cell => cell === 1).length;
    }

    countNewbornCells() {
        return this.grid.flat().filter((cell, index) => cell === 1 && this.previousGrid.flat()[index] === 0).length;
    }

    countNewlyDeadCells() {
        return this.grid.flat().filter((cell, index) => cell === 0 && this.previousGrid.flat()[index] === 1).length;
    }

    // Method to reschedule updates (used when global offset changes)
    rescheduleUpdates() {
        if (this.isRunning) {
            clearTimeout(this.timeout);
            this.start();
        }
    }
}

// Function to update Key and Scale options based on TET selection
function updateKeyAndScaleOptions() {
    const tet = document.getElementById('tet-select').value;
    const keySelect = document.getElementById('key-select');
    const scaleSelect = document.getElementById('scale-select');

    keySelect.innerHTML = '';
    scaleSelect.innerHTML = '';

    if (tet === '12') {
        // Standard keys for 12-TET
        const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        keys.forEach(key => {
            let option = document.createElement('option');
            option.value = key;
            option.text = key;
            keySelect.appendChild(option);
        });
    } else {
        // Limit to 'A' for other TET systems
        let option = document.createElement('option');
        option.value = 'A';
        option.text = 'A';
        keySelect.appendChild(option);
    }

    // Populate scales
    if (frequencies.scales[tet]) {
        for (let scaleName in frequencies.scales[tet]) {
            let option = document.createElement('option');
            option.value = scaleName;
            option.text = scaleName.charAt(0).toUpperCase() + scaleName.slice(1);
            scaleSelect.appendChild(option);
        }
    }
}

// Initialize Key and Scale options
updateKeyAndScaleOptions();

// Event Listener for TET Selection Change
document.getElementById('tet-select').addEventListener('change', updateKeyAndScaleOptions);

// Function to start automaton on the next downbeat
function startOnDownbeat(gameInstance) {
    //const baseTempo = parseInt(document.getElementById('tempo-slider').value);
    const baseTempo = 120;
    const msPerBeat = 60000 / baseTempo;

    const now = Date.now();
    const timeUntilNextBeat = msPerBeat - (now % msPerBeat);
    const globalRhythmicOffsetMs = globalRhythmicOffset * msPerBeat;

    let totalTimeUntilStart = timeUntilNextBeat + globalRhythmicOffsetMs;

    if (totalTimeUntilStart >= msPerBeat) {
        totalTimeUntilStart -= msPerBeat;
    }
    if (totalTimeUntilStart < 0) {
        totalTimeUntilStart += msPerBeat;
    }

    setTimeout(() => {
        gameInstance.start();
    }, totalTimeUntilStart);
}

// Add Simulation Event Listener
document.getElementById('add-simulation').addEventListener('click', function () {
    const simSize = parseInt(document.getElementById('sim-size').value);
    const tet = document.getElementById('tet-select').value;
    const key = document.getElementById('key-select').value;
    const scale = document.getElementById('scale-select').value;
    const synthName = document.getElementById('synth-select').value;
    const selectedSynth = synthInstruments[synthName];
    const isPopulated = document.getElementById('populate-automatas').checked;

    if (simSize < 1 || simSize > 48) {
        alert('Please enter a simulation size between 1 and 48.');
        return;
    }

    const container = document.createElement('div');
    container.className = 'container';

    const simArea = document.createElement('div');
    simArea.className = 'simulation-area';

    const canvas = document.createElement('canvas');
    simArea.appendChild(canvas);

    const optionsArea = document.createElement('div');
    optionsArea.className = 'options-area';

    // Control Icons Container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-container';

    const startButton = document.createElement('button');
    startButton.className = 'icon-button';
    startButton.innerHTML = '&#9658;'; // Play icon

    const stopButton = document.createElement('button');
    stopButton.className = 'icon-button';
    stopButton.innerHTML = '&#10074;&#10074;'; // Pause icon

    const rerandomizeButton = document.createElement('button');
    rerandomizeButton.className = 'icon-button';
    rerandomizeButton.innerHTML = '&#8635;'; // Re-randomize icon

    const deleteButton = document.createElement('button');
    deleteButton.className = 'icon-button';
    deleteButton.innerHTML = '&#128465;'; // Trashcan icon

    buttonsContainer.appendChild(startButton);
    buttonsContainer.appendChild(stopButton);
    buttonsContainer.appendChild(rerandomizeButton);
    buttonsContainer.appendChild(deleteButton);

    // Two Columns Container
    const twoColumnsContainer = document.createElement('div');
    twoColumnsContainer.className = 'two-columns-container';

    // Column 1: Key, Scale, Synth
    const column1 = document.createElement('div');
    column1.className = 'column';

    const keyLabel = document.createElement('div');
    keyLabel.className = 'info-label';
    keyLabel.innerText = `Key: ${key}`;

    const scaleLabel = document.createElement('div');
    scaleLabel.className = 'info-label';
    scaleLabel.innerText = `Scale: ${scale}`;

    const synthLabel = document.createElement('div');
    synthLabel.className = 'info-label';
    synthLabel.innerText = `Synth: ${synthName}`;

    column1.appendChild(keyLabel);
    column1.appendChild(scaleLabel);
    column1.appendChild(synthLabel);

    // Column 2: Alive, Newborn, Died
    const column2 = document.createElement('div');
    column2.className = 'column';

    const aliveLabel = document.createElement('div');
    aliveLabel.className = 'counter-label';
    aliveLabel.innerText = 'Alive: 0';

    const newbornLabel = document.createElement('div');
    newbornLabel.className = 'counter-label';
    newbornLabel.innerText = 'Newborn: 0';

    const diedLabel = document.createElement('div');
    diedLabel.className = 'counter-label';
    diedLabel.innerText = 'Died: 0';

    column2.appendChild(aliveLabel);
    column2.appendChild(newbornLabel);
    column2.appendChild(diedLabel);

    twoColumnsContainer.appendChild(column1);
    twoColumnsContainer.appendChild(column2);

    // Sliders and Other Controls
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';

    // Volume Slider
    const volumeContainer = document.createElement('div');
    volumeContainer.className = 'slider-container';

    const volumeHeader = document.createElement('div');
    volumeHeader.className = 'slider-header';

    const volumeLabel = document.createElement('label');
    volumeLabel.innerText = 'Volume:';
    volumeLabel.setAttribute('for', `volume-slider-${sliderIdCounter}`);

    const volumeValue = document.createElement('span');
    volumeValue.className = 'slider-value';
    volumeValue.innerText = '0.5';

    volumeHeader.appendChild(volumeLabel);
    volumeHeader.appendChild(volumeValue);

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.01';
    volumeSlider.value = '0.5';
    volumeSlider.id = `volume-slider-${sliderIdCounter}`;
    sliderIdCounter++;

    volumeContainer.appendChild(volumeHeader);
    volumeContainer.appendChild(volumeSlider);

    // Update Speed Slider
    const updateSpeedContainer = document.createElement('div');
    updateSpeedContainer.className = 'slider-container';

    const updateSpeedHeader = document.createElement('div');
    updateSpeedHeader.className = 'slider-header';

    const updateSpeedLabel = document.createElement('label');
    updateSpeedLabel.innerText = 'Update Speed:';
    updateSpeedLabel.setAttribute('for', `update-speed-slider-${sliderIdCounter}`);

    const updateSpeedValue = document.createElement('span');
    updateSpeedValue.className = 'slider-value';
    updateSpeedValue.innerText = '1.0';

    updateSpeedHeader.appendChild(updateSpeedLabel);
    updateSpeedHeader.appendChild(updateSpeedValue);

    const updateSpeedSlider = document.createElement('input');
    updateSpeedSlider.type = 'range';
    updateSpeedSlider.min = '0.25';
    updateSpeedSlider.max = '4';
    updateSpeedSlider.step = '0.25';
    updateSpeedSlider.value = '1';
    updateSpeedSlider.id = `update-speed-slider-${sliderIdCounter}`;
    sliderIdCounter++;

    updateSpeedContainer.appendChild(updateSpeedHeader);
    updateSpeedContainer.appendChild(updateSpeedSlider);

    // Rhythmic Offset Slider
    const rhythmicOffsetContainer = document.createElement('div');
    rhythmicOffsetContainer.className = 'slider-container';

    const rhythmicOffsetHeader = document.createElement('div');
    rhythmicOffsetHeader.className = 'slider-header';

    const rhythmicOffsetLabel = document.createElement('label');
    rhythmicOffsetLabel.innerText = 'Rhythmic Offset:';
    rhythmicOffsetLabel.setAttribute('for', `rhythmic-offset-slider-${sliderIdCounter}`);

    const rhythmicOffsetValue = document.createElement('span');
    rhythmicOffsetValue.className = 'slider-value';
    rhythmicOffsetValue.innerText = '0.00';

    rhythmicOffsetHeader.appendChild(rhythmicOffsetLabel);
    rhythmicOffsetHeader.appendChild(rhythmicOffsetValue);

    const rhythmicOffsetSlider = document.createElement('input');
    rhythmicOffsetSlider.type = 'range';
    rhythmicOffsetSlider.min = '0';
    rhythmicOffsetSlider.max = '1';
    rhythmicOffsetSlider.step = '0.05';
    rhythmicOffsetSlider.value = '0';
    rhythmicOffsetSlider.id = `rhythmic-offset-slider-${sliderIdCounter}`;
    sliderIdCounter++;

    rhythmicOffsetContainer.appendChild(rhythmicOffsetHeader);
    rhythmicOffsetContainer.appendChild(rhythmicOffsetSlider);

    controlsContainer.appendChild(volumeContainer);
    controlsContainer.appendChild(updateSpeedContainer);
    controlsContainer.appendChild(rhythmicOffsetContainer);

    // Number of Repetitions
    const repetitionsContainer = document.createElement('div');
    repetitionsContainer.className = 'repetitions-container';

    const repetitionsLabel = document.createElement('label');
    repetitionsLabel.innerText = 'Number of Repetitions:';
    repetitionsLabel.setAttribute('for', 'repetitions-select');

    const repetitionsSelect = document.createElement('select');
    repetitionsSelect.id = 'repetitions-select';
    for (let i = 1; i <= 10; i++) {
        let option = document.createElement('option');
        option.value = i;
        option.text = i;
        repetitionsSelect.appendChild(option);
    }

    repetitionsContainer.appendChild(repetitionsLabel);
    repetitionsContainer.appendChild(repetitionsSelect);

    controlsContainer.appendChild(repetitionsContainer);

    // Music Generation Types Dropdown
    const musicGenContainer = document.createElement('div');
    musicGenContainer.className = 'music-gen-container';

    const musicGenLabel = document.createElement('label');
    musicGenLabel.innerText = 'Music Generation Type:';
    musicGenLabel.setAttribute('for', `music-gen-select-${sliderIdCounter}`);

    const musicGenSelect = document.createElement('select');
    musicGenSelect.id = `music-gen-select-${sliderIdCounter}`;
    sliderIdCounter++;
    const musicGenOptions = [
        { value: 'rightmost-born', text: 'Rightmost Born' },
        { value: 'rightmost-alive', text: 'Rightmost Alive' },
        { value: 'born-cells', text: 'Born Cells' },
        { value: 'all-alive', text: 'All Alive' }
    ];
    musicGenOptions.forEach(opt => {
        let option = document.createElement('option');
        option.value = opt.value;
        option.text = opt.text;
        musicGenSelect.appendChild(option);
    });

    musicGenContainer.appendChild(musicGenLabel);
    musicGenContainer.appendChild(musicGenSelect);

    controlsContainer.appendChild(musicGenContainer);

    // Use State Count Checkbox
    const stateCountContainer = document.createElement('div');
    stateCountContainer.className = 'state-count-container';

    const stateCountCheckbox = document.createElement('input');
    stateCountCheckbox.type = 'checkbox';
    stateCountCheckbox.id = `state-count-checkbox-${sliderIdCounter}`;

    const stateCountLabel = document.createElement('label');
    stateCountLabel.setAttribute('for', `state-count-checkbox-${sliderIdCounter}`);
    stateCountLabel.innerText = 'Use state count to generate music';

    stateCountContainer.appendChild(stateCountCheckbox);
    stateCountContainer.appendChild(stateCountLabel);

    controlsContainer.appendChild(stateCountContainer);

    // Play Sound For: Checkboxes
    const playSoundForContainer = document.createElement('div');
    playSoundForContainer.className = 'play-sound-for-container';

    const playSoundForLabel = document.createElement('div');
    playSoundForLabel.className = 'play-sound-for-label';
    playSoundForLabel.innerText = 'Play sound for:';

    // Total Alive Cells Checkbox
    const aliveCheckboxContainer = document.createElement('label');
    aliveCheckboxContainer.className = 'checkbox-container';

    const aliveCheckbox = document.createElement('input');
    aliveCheckbox.type = 'checkbox';
    aliveCheckbox.id = `alive-checkbox-${sliderIdCounter}`;
    aliveCheckbox.disabled = !stateCountCheckbox.checked;

    const aliveCheckboxLabel = document.createElement('span');
    aliveCheckboxLabel.innerText = 'Total Alive Cells';

    aliveCheckboxContainer.appendChild(aliveCheckbox);
    aliveCheckboxContainer.appendChild(aliveCheckboxLabel);

    // Newly Dead Cells Checkbox
    const newlyDeadCheckboxContainer = document.createElement('label');
    newlyDeadCheckboxContainer.className = 'checkbox-container';

    const newlyDeadCheckbox = document.createElement('input');
    newlyDeadCheckbox.type = 'checkbox';
    newlyDeadCheckbox.id = `newly-dead-checkbox-${sliderIdCounter}`;
    newlyDeadCheckbox.disabled = !stateCountCheckbox.checked;

    const newlyDeadCheckboxLabel = document.createElement('span');
    newlyDeadCheckboxLabel.innerText = 'Newly Dead Cells';

    newlyDeadCheckboxContainer.appendChild(newlyDeadCheckbox);
    newlyDeadCheckboxContainer.appendChild(newlyDeadCheckboxLabel);

    // Newly Alive Cells Checkbox
    const newbornCheckboxContainer = document.createElement('label');
    newbornCheckboxContainer.className = 'checkbox-container';

    const newbornCheckbox = document.createElement('input');
    newbornCheckbox.type = 'checkbox';
    newbornCheckbox.id = `newborn-checkbox-${sliderIdCounter}`;
    newbornCheckbox.disabled = !stateCountCheckbox.checked;

    const newbornCheckboxLabel = document.createElement('span');
    newbornCheckboxLabel.innerText = 'Newly Alive Cells';

    newbornCheckboxContainer.appendChild(newbornCheckbox);
    newbornCheckboxContainer.appendChild(newbornCheckboxLabel);

    playSoundForContainer.appendChild(playSoundForLabel);
    playSoundForContainer.appendChild(aliveCheckboxContainer);
    playSoundForContainer.appendChild(newlyDeadCheckboxContainer);
    playSoundForContainer.appendChild(newbornCheckboxContainer);

    controlsContainer.appendChild(playSoundForContainer);

    // Assemble Options Area
    optionsArea.appendChild(buttonsContainer);
    optionsArea.appendChild(twoColumnsContainer);
    optionsArea.appendChild(controlsContainer);

    container.appendChild(simArea);
    container.appendChild(optionsArea);
    document.getElementById('left-side').appendChild(container);

    // Set Canvas Dimensions
    canvas.width = simArea.clientWidth;
    canvas.height = simArea.clientHeight;

    // Define Controls Object
    const controls = {
        volumeSlider: volumeSlider,
        volumeValue: volumeValue,
        updateSpeedSlider: updateSpeedSlider,
        updateSpeedValue: updateSpeedValue,
        rhythmicOffsetSlider: rhythmicOffsetSlider,
        rhythmicOffsetValue: rhythmicOffsetValue,
        repetitionsSelect: repetitionsSelect,
        musicGenSelect: musicGenSelect,
        soundModeToggle: stateCountCheckbox,
        soundModeSelect: musicGenSelect, // Now using musicGenSelect for mode
        aliveCheckbox: aliveCheckbox,
        newlyDeadCheckbox: newlyDeadCheckbox,
        newbornCheckbox: newbornCheckbox
    };

    // Initialize GameOfLife Instance
    const game = new GameOfLife(simSize, simSize, canvas, {
        alive: aliveLabel,
        newborn: newbornLabel,
        newlyDead: diedLabel
    }, key, scale, container, controls, tet, selectedSynth);

    if (isPopulated) {
        game.randomizeGrid();
    }

    // Event Listeners for Control Icons
    startButton.addEventListener('click', () => startOnDownbeat(game));
    stopButton.addEventListener('click', () => game.stop());
    rerandomizeButton.addEventListener('click', () => game.randomizeGrid());
    deleteButton.addEventListener('click', () => {
        game.stop();
        container.remove();
    });

    // Event Listener to Enable/Disable Checkboxes Based on State Count Toggle
    stateCountCheckbox.addEventListener('change', () => {
        const isChecked = stateCountCheckbox.checked;
        aliveCheckbox.disabled = !isChecked;
        newlyDeadCheckbox.disabled = !isChecked;
        newbornCheckbox.disabled = !isChecked;

        if (!isChecked) {
            aliveCheckbox.checked = false;
            newlyDeadCheckbox.checked = false;
            newbornCheckbox.checked = false;
        }
    });

    // Update Slider Value Displays on Input
    volumeSlider.addEventListener('input', () => {
        controls.volumeValue.innerText = volumeSlider.value;
    });

    updateSpeedSlider.addEventListener('input', () => {
        controls.updateSpeedValue.innerText = parseFloat(updateSpeedSlider.value).toFixed(2);
    });

    rhythmicOffsetSlider.addEventListener('input', () => {
        controls.rhythmicOffsetValue.innerText = parseFloat(rhythmicOffsetSlider.value).toFixed(2);
    });
});

// Tempo Slider Functionality
//document.getElementById('tempo-slider').addEventListener('input', function() {
//    const tempo = document.getElementById('tempo-slider').value;
//    document.getElementById('tempo-value').innerText = `${tempo} BPM`;
//});
