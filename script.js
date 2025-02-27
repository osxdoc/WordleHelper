// Globale Variablen
let wordList = [];
let attempts = [];
let currentWord = ['', '', '', '', ''];
let currentStatus = ['gray', 'gray', 'gray', 'gray', 'gray'];
let selectedLetterIndex = -1;

// Konstanten für die Buchstabenstatus
const STATUS = {
    GRAY: 'gray',
    YELLOW: 'yellow',
    GREEN: 'green'
};

// Lade die Wörterliste beim Start
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('5-letter-de.txt');
        const text = await response.text();
        wordList = text.split('\n')
            .map(word => word.trim().toLowerCase())
            .filter(word => word.length === 5);
        
        console.log(`Wörterliste geladen: ${wordList.length} Wörter`);
        
        // Initialisiere die Benutzeroberfläche
        initUI();
    } catch (error) {
        console.error('Fehler beim Laden der Wörterliste:', error);
        alert('Die Wörterliste konnte nicht geladen werden. Bitte laden Sie die Seite neu.');
    }
});

// Initialisiere die Benutzeroberfläche
function initUI() {
    // Initialisiere die Buchstabenfelder
    const letterBoxes = document.querySelectorAll('.letter-box');
    letterBoxes.forEach((box, index) => {
        box.addEventListener('click', () => selectLetterBox(index));
    });
    
    // Status-Indikatoren wurden entfernt
    
    // Initialisiere die Farb-Buttons unter den Buchstabenfeldern
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const letterIndex = parseInt(button.getAttribute('data-letter'));
            const colorIndex = parseInt(button.getAttribute('data-color'));
            
            // Wähle zuerst das entsprechende Buchstabenfeld aus
            selectLetterBox(letterIndex);
            
            // Setze dann den Status
            setLetterStatus(colorIndex);
        });
    });
    
    // Initialisiere die Buttons
    document.getElementById('add-word').addEventListener('click', addCurrentWord);
    document.getElementById('reset').addEventListener('click', resetGame);
    
    // Tastatureingaben abfangen
    document.addEventListener('keydown', handleKeyPress);
}

// Wähle ein Buchstabenfeld aus
function selectLetterBox(index) {
    // Entferne die Auswahl vom vorherigen Feld
    if (selectedLetterIndex >= 0) {
        document.getElementById(`letter-${selectedLetterIndex + 1}`).style.borderColor = '#ccc';
    }
    
    // Setze die neue Auswahl
    selectedLetterIndex = index;
    document.getElementById(`letter-${index + 1}`).style.borderColor = '#333';
}

// Setze den Status eines Buchstabens
function setLetterStatus(statusIndex) {
    if (selectedLetterIndex < 0) return;
    
    const statusMap = [STATUS.GRAY, STATUS.YELLOW, STATUS.GREEN];
    currentStatus[selectedLetterIndex] = statusMap[statusIndex];
    
    // Aktualisiere die Anzeige
    updateLetterBoxDisplay();
}

// Aktualisiere die Anzeige der Buchstabenfelder
function updateLetterBoxDisplay() {
    for (let i = 0; i < 5; i++) {
        const box = document.getElementById(`letter-${i + 1}`);
        box.textContent = currentWord[i].toUpperCase();
        
        // Setze die Hintergrundfarbe entsprechend dem Status
        switch (currentStatus[i]) {
            case STATUS.GRAY:
                box.style.backgroundColor = '#888';
                box.style.color = 'white';
                break;
            case STATUS.YELLOW:
                box.style.backgroundColor = '#c9b458';
                box.style.color = 'white';
                break;
            case STATUS.GREEN:
                box.style.backgroundColor = '#6aaa64';
                box.style.color = 'white';
                break;
            default:
                box.style.backgroundColor = 'white';
                box.style.color = 'black';
        }
    }
}

// Füge das aktuelle Wort zu den Versuchen hinzu
function addCurrentWord() {
    // Prüfe, ob alle Buchstaben eingegeben wurden
    if (currentWord.some(letter => letter === '')) {
        alert('Bitte geben Sie alle 5 Buchstaben ein.');
        return;
    }
    
    // Füge das Wort zu den Versuchen hinzu
    attempts.push({
        word: [...currentWord],
        status: [...currentStatus]
    });
    
    // Zeige die bisherigen Versuche an
    displayAttempts();
    
    // Aktualisiere die Lösungsvorschläge
    updateSuggestions();
    
    // Setze das aktuelle Wort zurück
    resetCurrentWord();
}

// Zeige die bisherigen Versuche an
function displayAttempts() {
    const historyContainer = document.getElementById('word-history');
    historyContainer.innerHTML = '';
    
    attempts.forEach(attempt => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        attempt.word.forEach((letter, index) => {
            const historyLetter = document.createElement('div');
            historyLetter.className = 'history-letter';
            historyLetter.textContent = letter.toUpperCase();
            
            // Setze die Hintergrundfarbe entsprechend dem Status
            switch (attempt.status[index]) {
                case STATUS.GRAY:
                    historyLetter.style.backgroundColor = '#888';
                    break;
                case STATUS.YELLOW:
                    historyLetter.style.backgroundColor = '#c9b458';
                    break;
                case STATUS.GREEN:
                    historyLetter.style.backgroundColor = '#6aaa64';
                    break;
            }
            
            historyItem.appendChild(historyLetter);
        });
        
        historyContainer.appendChild(historyItem);
    });
}

// Aktualisiere die Lösungsvorschläge
function updateSuggestions() {
    // Filtere die Wörterliste basierend auf den bisherigen Versuchen
    let filteredWords = [...wordList];
    
    // Sammle Informationen über die Buchstaben
    const greenLetters = {}; // Buchstaben an fester Position
    const yellowLetters = {}; // Buchstaben, die vorkommen müssen, aber nicht an dieser Position
    const grayLetters = new Set(); // Buchstaben, die nicht vorkommen dürfen
    
    // Analysiere alle bisherigen Versuche
    attempts.forEach(attempt => {
        attempt.word.forEach((letter, index) => {
            switch (attempt.status[index]) {
                case STATUS.GREEN:
                    greenLetters[index] = letter;
                    break;
                case STATUS.YELLOW:
                    if (!yellowLetters[letter]) {
                        yellowLetters[letter] = [];
                    }
                    yellowLetters[letter].push(index);
                    break;
                case STATUS.GRAY:
                    // Prüfe, ob der Buchstabe nicht bereits als grün oder gelb markiert wurde
                    const isGreenOrYellow = Object.values(greenLetters).includes(letter) || 
                                           Object.keys(yellowLetters).includes(letter);
                    if (!isGreenOrYellow) {
                        grayLetters.add(letter);
                    }
                    break;
            }
        });
    });
    
    // Filtere die Wörter basierend auf den gesammelten Informationen
    filteredWords = filteredWords.filter(word => {
        // Prüfe grüne Buchstaben (feste Position)
        for (const [index, letter] of Object.entries(greenLetters)) {
            if (word[index] !== letter) {
                return false;
            }
        }
        
        // Prüfe gelbe Buchstaben (müssen vorkommen, aber nicht an dieser Position)
        for (const [letter, positions] of Object.entries(yellowLetters)) {
            if (!word.includes(letter)) {
                return false;
            }
            
            // Der Buchstabe darf nicht an den Positionen sein, wo er als gelb markiert wurde
            for (const position of positions) {
                if (word[position] === letter) {
                    return false;
                }
            }
        }
        
        // Prüfe graue Buchstaben (dürfen nicht vorkommen)
        for (const letter of grayLetters) {
            if (word.includes(letter)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Zeige die gefilterten Wörter an
    displaySuggestions(filteredWords);
}

// Zeige die Lösungsvorschläge an
function displaySuggestions(words) {
    const suggestionList = document.getElementById('suggestion-list');
    const suggestionCount = document.getElementById('suggestion-count');
    
    suggestionList.innerHTML = '';
    suggestionCount.textContent = words.length;
    
    words.forEach(word => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = word.toUpperCase();
        suggestionItem.addEventListener('click', () => selectSuggestion(word));
        
        suggestionList.appendChild(suggestionItem);
    });
}

// Wähle einen Lösungsvorschlag aus
function selectSuggestion(word) {
    currentWord = word.split('');
    updateLetterBoxDisplay();
}

// Setze das aktuelle Wort zurück
function resetCurrentWord() {
    currentWord = ['', '', '', '', ''];
    currentStatus = ['gray', 'gray', 'gray', 'gray', 'gray'];
    selectedLetterIndex = -1;
    
    // Aktualisiere die Anzeige
    const letterBoxes = document.querySelectorAll('.letter-box');
    letterBoxes.forEach(box => {
        box.textContent = '';
        box.style.backgroundColor = 'white';
        box.style.color = 'black';
        box.style.borderColor = '#ccc';
    });
}

// Setze das Spiel zurück
function resetGame() {
    attempts = [];
    resetCurrentWord();
    
    // Leere die Anzeige der bisherigen Versuche
    document.getElementById('word-history').innerHTML = '';
    
    // Zeige alle Wörter als Vorschläge an
    displaySuggestions(wordList);
}

// Behandle Tastatureingaben
function handleKeyPress(event) {
    // Buchstabeneingabe (a-z, A-Z)
    if (/^[a-zA-Z]$/.test(event.key) && selectedLetterIndex >= 0) {
        currentWord[selectedLetterIndex] = event.key.toLowerCase();
        updateLetterBoxDisplay();
        
        // Wechsle zum nächsten Feld, wenn nicht am Ende
        if (selectedLetterIndex < 4) {
            selectLetterBox(selectedLetterIndex + 1);
        }
    }
    // Backspace/Delete
    else if (event.key === 'Backspace' && selectedLetterIndex >= 0) {
        currentWord[selectedLetterIndex] = '';
        updateLetterBoxDisplay();
    }
    // Pfeiltasten für Navigation
    else if (event.key === 'ArrowLeft' && selectedLetterIndex > 0) {
        selectLetterBox(selectedLetterIndex - 1);
    }
    else if (event.key === 'ArrowRight' && selectedLetterIndex < 4) {
        selectLetterBox(selectedLetterIndex + 1);
    }
    // Enter zum Hinzufügen des Wortes
    else if (event.key === 'Enter') {
        addCurrentWord();
    }
    // Zahlen 1-3 zum Setzen des Status
    else if (['1', '2', '3'].includes(event.key) && selectedLetterIndex >= 0) {
        setLetterStatus(parseInt(event.key) - 1);
    }
}