const GLOBAL_DOWNBEAT_TIME = new Date("2024-01-01T00:00:00Z").getTime();

// Use a shared AudioContext among all Synth instances
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
        this.previousGrid = this.createGrid();
        this.isRunning = false; 
        this.controls = controls;   
        this.tet = tet;
        this.synth = new Synth(synth);

        this.audioContext = Synth.audioContext;
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = parseFloat(this.controls.volumeSlider.value);
        this.gainNode.connect(this.audioContext.destination);

        this.controls.volumeSlider.addEventListener('input', () => {
            this.gainNode.gain.value = parseFloat(this.controls.volumeSlider.value);
        });

        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));

        const rescheduleUpdates = () => {
            if (this.isRunning) {
                clearTimeout(this.timeout);
                this.start(); 
            }
        };

        this.controls.updateSpeedSlider.addEventListener('input', rescheduleUpdates);
        this.controls.rhythmicOffsetSlider.addEventListener('input', rescheduleUpdates);

        // Initialize repetitions
        this.numRepetitions = parseInt(this.controls.repetitionsSelect.value) || 1;
        this.currentRepetition = 0;

        this.controls.repetitionsSelect.addEventListener('change', () => {
            this.numRepetitions = parseInt(this.controls.repetitionsSelect.value) || 1;
        });

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
                this.grid[i][j] = Math.floor(Math.random() * 2); // Randomize every time
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
                    this.context.fillStyle = previousState === 0 ? '#00ff00' : '#000000'; // Green for born cells, black for alive cells
                } else {
                    this.context.fillStyle = previousState === 1 ? '#ff0000' : '#ffffff'; // Red for newly dead cells, white for dead cells
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
        const selectedMode = this.controls.soundModeSelect.value;

        if (this.currentRepetition < this.numRepetitions) {
            // Generate sound without updating the grid
            if (isStateBasedMode) {
                this.generateSound(); // No mode needed for state-based
            } else {
                this.generateSound(selectedMode); // Pass the selected mode
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
        this.counterElements.newlyDead.innerText = `Newly Dead: ${newlyDeadCount}`;
    
        if (isStateBasedMode) {
            this.generateSound(); // No mode needed for state-based
        } else {
            this.generateSound(selectedMode); // Pass the selected mode
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
            const baseTempo = parseInt(document.getElementById('tempo-slider').value);
            const speedMultiplier = parseFloat(this.controls.updateSpeedSlider.value);
            const interval = (60000 / baseTempo) * (1 / speedMultiplier);
    
            const rhythmicOffsetBeats = parseFloat(this.controls.rhythmicOffsetSlider.value);
            const rhythmicOffsetMs = rhythmicOffsetBeats * interval;
    
            // exact delay until the next update
            const now = Date.now();
            const timeSinceLastUpdate = now % interval;
            let timeUntilNextUpdate = interval - timeSinceLastUpdate + rhythmicOffsetMs;
    
            if (timeUntilNextUpdate >= interval) {
                timeUntilNextUpdate -= interval;
            }
    
            // recursively schedule updates
            this.timeout = setTimeout(() => {
                this.updateGrid();
    
                if (this.isRunning) {
                    scheduleNextUpdate();
                }
            }, timeUntilNextUpdate);
        };
    
        scheduleNextUpdate();
    
        const rescheduleUpdates = () => {
            if (this.isRunning) {
                clearTimeout(this.timeout); 
                scheduleNextUpdate();     
            }
        };
    
        this.controls.updateSpeedSlider.addEventListener('input', rescheduleUpdates);
        this.controls.rhythmicOffsetSlider.addEventListener('input', rescheduleUpdates);
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

            if (this.controls.aliveSoundCheckbox.checked && aliveCount > 0) {
                const freq = getFrequency(aliveCount, -2);
                if (freq) {
                    this.synth.play(freq, volume, 0.5);
                    playedFrequencies.push(freq);
                }
            }
            if (this.controls.newlyDeadSoundCheckbox.checked && newlyDeadCount > 0) {
                const freq = getFrequency(newlyDeadCount, -2);
                if (freq) {
                    this.synth.play(freq, volume, 0.5);
                    playedFrequencies.push(freq);
                }
            }
            if (this.controls.newbornSoundCheckbox.checked && newbornCount > 0) {
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
}

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

// Call the function initially to populate options
updateKeyAndScaleOptions();

document.getElementById('tet-select').addEventListener('change', updateKeyAndScaleOptions);

let globalStartTimer;

// Track automata that need to start on the next downbeat
const automataToStart = new Set();

function startOnDownbeat(gameInstance) {
    // Add the instance to the set of automata to start
    automataToStart.add(gameInstance);

    if (globalStartTimer) clearTimeout(globalStartTimer);

    const baseTempo = parseInt(document.getElementById('tempo-slider').value);
    const msPerBeat = 60000 / baseTempo;
    const now = Date.now();
    
    // Calculate time until the next downbeat based on GLOBAL_DOWNBEAT_TIME
    const timeSinceGlobalDownbeat = (now - GLOBAL_DOWNBEAT_TIME) % msPerBeat;
    const timeUntilNextGlobalDownbeat = msPerBeat - timeSinceGlobalDownbeat;

    // Schedule to start each automaton instance on the next downbeat
    globalStartTimer = setTimeout(() => {
        automataToStart.forEach(instance => instance.start());
        automataToStart.clear(); // Clear the set after starting all instances
    }, timeUntilNextGlobalDownbeat);
}

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

    const keyLabel = document.createElement('span');
    const scaleLabel = document.createElement('span');
    keyLabel.innerText = `Key: ${key}`;
    scaleLabel.innerText = `Scale: ${scale}`;
    optionsArea.appendChild(keyLabel);
    optionsArea.appendChild(scaleLabel);

    // Display the selected synth instrument in the options area
    const synthLabel = document.createElement('span');
    synthLabel.innerText = `Synth: ${synthName}`;
    optionsArea.appendChild(synthLabel);

    const aliveCountLabel = document.createElement('span');
    const newbornCountLabel = document.createElement('span');
    const newlyDeadCountLabel = document.createElement('span');

    const counters = { alive: aliveCountLabel, newborn: newbornCountLabel, newlyDead: newlyDeadCountLabel };
    aliveCountLabel.innerText = 'Alive: 0';
    newbornCountLabel.innerText = 'Newborn: 0';
    newlyDeadCountLabel.innerText = 'Newly Dead: 0';

    optionsArea.appendChild(aliveCountLabel);
    optionsArea.appendChild(newbornCountLabel);
    optionsArea.appendChild(newlyDeadCountLabel);

    const startButton = document.createElement('button');
    startButton.innerText = 'Start Simulation';
    optionsArea.appendChild(startButton);

    const stopButton = document.createElement('button');
    stopButton.innerText = 'Stop Simulation';
    optionsArea.appendChild(stopButton);

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.1';
    volumeSlider.value = '0.5';

    const volumeLabel = document.createElement('label');
    volumeLabel.innerText = 'Volume: 0.5';
    volumeSlider.addEventListener('input', () => volumeLabel.innerText = `Volume: ${volumeSlider.value}`);

    optionsArea.appendChild(volumeLabel);
    optionsArea.appendChild(volumeSlider);

    const updateSpeedSlider = document.createElement('input');
    updateSpeedSlider.type = 'range';
    updateSpeedSlider.min = '0.25';
    updateSpeedSlider.max = '4.0';
    updateSpeedSlider.step = '0.25';
    updateSpeedSlider.value = '1.0';

    const updateSpeedLabel = document.createElement('label');
    updateSpeedLabel.innerText = 'Update Speed: 1x';
    updateSpeedSlider.addEventListener('input', () => updateSpeedLabel.innerText = `Update Speed: ${updateSpeedSlider.value}x`);

    optionsArea.appendChild(updateSpeedLabel);
    optionsArea.appendChild(updateSpeedSlider);

    const rhythmicOffsetSlider = document.createElement('input');
    rhythmicOffsetSlider.type = 'range';
    rhythmicOffsetSlider.min = '0';
    rhythmicOffsetSlider.max = '1';
    rhythmicOffsetSlider.step = '0.05';
    rhythmicOffsetSlider.value = '0';
    
    const rhythmicOffsetLabel = document.createElement('label');
    rhythmicOffsetLabel.innerText = 'Rhythmic Offset: 0';
    
    rhythmicOffsetSlider.addEventListener('input', () => {
        rhythmicOffsetLabel.innerText = `Rhythmic Offset: ${rhythmicOffsetSlider.value}`;
    });
    
    optionsArea.appendChild(rhythmicOffsetLabel);
    optionsArea.appendChild(rhythmicOffsetSlider);

    // Number of Repetitions Control
    const repetitionsLabel = document.createElement('label');
    repetitionsLabel.innerText = 'Number of Repetitions: ';
    repetitionsLabel.style.display = 'block';
    repetitionsLabel.style.marginTop = '10px';

    const repetitionsSelect = document.createElement('select');

    for (let i = 1; i <= 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = i;
        repetitionsSelect.appendChild(option);
    }

    repetitionsLabel.appendChild(repetitionsSelect);
    optionsArea.appendChild(repetitionsLabel);

    // Sound Mode Selection
    const soundModeSelect = document.createElement('select');
    soundModeSelect.className = 'sound-mode-select';
    soundModeSelect.innerHTML = `
        <option value="rightmost-born">Play Rightmost Born Cells</option>
        <option value="rightmost-alive">Play Rightmost Alive Cells</option>
        <option value="born-cells">Play Born Cells</option>
        <option value="all-alive">Play All Alive Cells</option>
    `;
    soundModeSelect.style.display = 'block';
    soundModeSelect.style.marginTop = '10px';
    optionsArea.appendChild(soundModeSelect);

    // Sound Mode Toggle
    const soundModeToggleContainer = document.createElement('div');
    soundModeToggleContainer.style.display = 'flex';
    soundModeToggleContainer.style.alignItems = 'center';
    soundModeToggleContainer.style.marginTop = '10px';

    const soundModeToggle = document.createElement('input');
    soundModeToggle.type = 'checkbox';
    soundModeToggle.id = `soundModeToggle-${Date.now()}`;
    soundModeToggle.checked = false;

    const soundModeLabel = document.createElement('label');
    soundModeLabel.innerText = 'Use state counts to generate audio';
    soundModeLabel.setAttribute('for', soundModeToggle.id);
    soundModeLabel.style.marginLeft = '5px';

    soundModeToggleContainer.appendChild(soundModeToggle);
    soundModeToggleContainer.appendChild(soundModeLabel);
    optionsArea.appendChild(soundModeToggleContainer);

    // New Sound Options for State-Based Mode
    const newSoundOptionsContainer = document.createElement('div');
    newSoundOptionsContainer.style.marginTop = '10px';

    const aliveSoundCheckbox = document.createElement('input');
    aliveSoundCheckbox.type = 'checkbox';
    aliveSoundCheckbox.checked = true;
    const aliveSoundLabel = document.createElement('label');
    aliveSoundLabel.innerText = 'Play sound for total alive cells';
    aliveSoundLabel.prepend(aliveSoundCheckbox);

    const newlyDeadSoundCheckbox = document.createElement('input');
    newlyDeadSoundCheckbox.type = 'checkbox';
    newlyDeadSoundCheckbox.checked = true;
    const newlyDeadSoundLabel = document.createElement('label');
    newlyDeadSoundLabel.innerText = 'Play sound for newly dead cells';
    newlyDeadSoundLabel.prepend(newlyDeadSoundCheckbox);

    const newbornSoundCheckbox = document.createElement('input');
    newbornSoundCheckbox.type = 'checkbox';
    newbornSoundCheckbox.checked = true;
    const newbornSoundLabel = document.createElement('label');
    newbornSoundLabel.innerText = 'Play sound for newly alive cells';
    newbornSoundLabel.prepend(newbornSoundCheckbox);

    newSoundOptionsContainer.append(aliveSoundLabel, newlyDeadSoundLabel, newbornSoundLabel);
    optionsArea.appendChild(newSoundOptionsContainer);

    const updateNewSoundOptionsState = () => {
        const isChecked = soundModeToggle.checked;
        aliveSoundCheckbox.disabled = !isChecked;
        newlyDeadSoundCheckbox.disabled = !isChecked;
        newbornSoundCheckbox.disabled = !isChecked;
        soundModeSelect.disabled = isChecked;
    };

    soundModeToggle.addEventListener('change', updateNewSoundOptionsState);
    updateNewSoundOptionsState();

    // Rerandomize and Delete Buttons
    const rerandomizeButton = document.createElement('button');
    rerandomizeButton.innerText = 'Re-randomize Automaton';
    rerandomizeButton.className = 'rerandomize-button';
    rerandomizeButton.style.display = 'block';
    rerandomizeButton.style.marginTop = '10px';
    optionsArea.appendChild(rerandomizeButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete Simulation';
    deleteButton.className = 'delete-button';
    deleteButton.style.display = 'block';
    deleteButton.style.marginTop = '10px';
    optionsArea.appendChild(deleteButton);

    container.appendChild(simArea);
    container.appendChild(optionsArea);
    document.getElementById('left-side').appendChild(container);

    canvas.width = simArea.clientWidth;
    canvas.height = simArea.clientHeight;

    const controls = {
        soundModeToggle: soundModeToggle,
        soundModeSelect: soundModeSelect,
        aliveSoundCheckbox: aliveSoundCheckbox,
        newlyDeadSoundCheckbox: newlyDeadSoundCheckbox,
        newbornSoundCheckbox: newbornSoundCheckbox,
        updateSpeedSlider: updateSpeedSlider,
        volumeSlider: volumeSlider,
        rhythmicOffsetSlider: rhythmicOffsetSlider,
        repetitionsSelect: repetitionsSelect
    };

    const game = new GameOfLife(simSize, simSize, canvas, counters, key, scale, container, controls, tet, selectedSynth);

    if (isPopulated) {
        game.randomizeGrid();
    }

    startButton.addEventListener('click', () => {
        startOnDownbeat(game);
    });

    stopButton.addEventListener('click', () => game.stop());

    rerandomizeButton.addEventListener('click', () => {
        game.randomizeGrid();
    });

    deleteButton.addEventListener('click', () => {
        game.stop();
        container.remove();
    });

    window.addEventListener('resize', () => {
        canvas.width = simArea.clientWidth;
        canvas.height = simArea.clientHeight;
        game.renderGrid();
    });
});

// Tempo slider functionality
document.getElementById('tempo-slider').addEventListener('input', function() {
    const tempo = document.getElementById('tempo-slider').value;
    document.getElementById('tempo-value').innerText = `${tempo} BPM`;
});
