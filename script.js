// ==================== //
// Global State
// ==================== //
let currentThought = {
    situation: '',
    thoughts: '',
    emotions: [],
    emotionIntensity: 5,
    distortions: [],
    evidenceFor: '',
    evidenceAgainst: '',
    reframe: '',
    beliefRating: 5,
    timestamp: null
};

let breathingInterval = null;
let breathingState = 'stopped';

// ==================== //
// Initialization
// ==================== //
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up navigation
    setupNavigation();

    // Set up intensity sliders
    setupSliders();

    // Load journal and stats
    loadJournal();
    loadStats();
    loadMoodHistory();

    // Show random affirmation
    newAffirmation();

    // Check if there's a saved draft
    loadDraft();
}

// ==================== //
// Navigation
// ==================== //
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            switchView(view);
        });
    });
}

function switchView(viewName) {
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-view') === viewName) {
            btn.classList.add('active');
        }
    });

    // Update active view
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewName).classList.add('active');

    // Refresh data when switching to certain views
    if (viewName === 'journal') {
        loadJournal();
        loadStats();
    }
    if (viewName === 'mood') {
        loadMoodHistory();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== //
// Slider Setup
// ==================== //
function setupSliders() {
    const emotionSlider = document.getElementById('emotionIntensity');
    const intensityValue = document.getElementById('intensityValue');

    emotionSlider.addEventListener('input', function() {
        intensityValue.textContent = this.value;
    });

    const beliefSlider = document.getElementById('beliefRating');
    const beliefValue = document.getElementById('beliefValue');

    beliefSlider.addEventListener('input', function() {
        beliefValue.textContent = this.value;
    });
}

// ==================== //
// Thought Journey Navigation
// ==================== //
function nextStep(stepNumber) {
    // Save current step data
    saveCurrentStepData(stepNumber - 1);

    // Hide current step
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });

    // Show next step
    const nextStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (nextStep) {
        nextStep.classList.add('active');
        nextStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Save draft
    saveDraft();
}

function prevStep(stepNumber) {
    // Hide current step
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });

    // Show previous step
    const prevStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (prevStep) {
        prevStep.classList.add('active');
        prevStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function saveCurrentStepData(stepNumber) {
    switch(stepNumber) {
        case 1:
            currentThought.situation = document.getElementById('situation').value;
            break;
        case 2:
            currentThought.thoughts = document.getElementById('thoughts').value;
            break;
        case 3:
            currentThought.emotions = Array.from(document.querySelectorAll('input[name="emotion"]:checked'))
                .map(el => el.value);
            currentThought.emotionIntensity = parseInt(document.getElementById('emotionIntensity').value);
            break;
        case 4:
            currentThought.distortions = Array.from(document.querySelectorAll('input[name="distortion"]:checked'))
                .map(el => el.value);
            break;
        case 5:
            currentThought.evidenceFor = document.getElementById('evidenceFor').value;
            currentThought.evidenceAgainst = document.getElementById('evidenceAgainst').value;
            break;
        case 6:
            currentThought.reframe = document.getElementById('reframe').value;
            currentThought.beliefRating = parseInt(document.getElementById('beliefRating').value);
            break;
    }
}

// ==================== //
// Save Thought Record
// ==================== //
function saveThoughtRecord() {
    // Save final step data
    saveCurrentStepData(6);

    // Add timestamp
    currentThought.timestamp = new Date().toISOString();

    // Get existing records
    let records = JSON.parse(localStorage.getItem('thoughtRecords') || '[]');

    // Add new record
    records.unshift(currentThought);

    // Keep only last 50 records
    if (records.length > 50) {
        records = records.slice(0, 50);
    }

    // Save to localStorage
    localStorage.setItem('thoughtRecords', JSON.stringify(records));

    // Show summary
    showSummary();

    // Move to summary step
    nextStep(7);

    // Clear draft
    localStorage.removeItem('thoughtDraft');
}

function showSummary() {
    const summaryCard = document.getElementById('summaryCard');

    const distortionNames = {
        'all-or-nothing': 'All-or-Nothing Thinking',
        'catastrophizing': 'Catastrophizing',
        'mind-reading': 'Mind Reading',
        'overgeneralization': 'Overgeneralization',
        'personalization': 'Personalization',
        'should-statements': '"Should" Statements',
        'emotional-reasoning': 'Emotional Reasoning',
        'fortune-telling': 'Fortune Telling'
    };

    let html = `
        <h4>Situation</h4>
        <p>${currentThought.situation || 'Not specified'}</p>

        <h4>Initial Thoughts</h4>
        <p>${currentThought.thoughts || 'Not specified'}</p>

        <h4>Emotions (Intensity: ${currentThought.emotionIntensity}/10)</h4>
        <p>${currentThought.emotions.length > 0 ? currentThought.emotions.join(', ') : 'Not specified'}</p>
    `;

    if (currentThought.distortions.length > 0) {
        html += `
            <h4>Thinking Traps Identified</h4>
            <ul>
                ${currentThought.distortions.map(d => `<li>${distortionNames[d]}</li>`).join('')}
            </ul>
        `;
    }

    html += `
        <h4>Balanced Perspective</h4>
        <p>${currentThought.reframe || 'Not specified'}</p>

        <h4>Belief in New Thought</h4>
        <p>${currentThought.beliefRating}/10</p>
    `;

    summaryCard.innerHTML = html;
}

function startNewThought() {
    // Reset current thought
    currentThought = {
        situation: '',
        thoughts: '',
        emotions: [],
        emotionIntensity: 5,
        distortions: [],
        evidenceFor: '',
        evidenceAgainst: '',
        reframe: '',
        beliefRating: 5,
        timestamp: null
    };

    // Clear form
    document.getElementById('situation').value = '';
    document.getElementById('thoughts').value = '';
    document.querySelectorAll('input[name="emotion"]').forEach(el => el.checked = false);
    document.getElementById('emotionIntensity').value = 5;
    document.getElementById('intensityValue').textContent = 5;
    document.querySelectorAll('input[name="distortion"]').forEach(el => el.checked = false);
    document.getElementById('evidenceFor').value = '';
    document.getElementById('evidenceAgainst').value = '';
    document.getElementById('reframe').value = '';
    document.getElementById('beliefRating').value = 5;
    document.getElementById('beliefValue').textContent = 5;

    // Go to first step
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector('[data-step="1"]').classList.add('active');

    // Clear draft
    localStorage.removeItem('thoughtDraft');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== //
// Draft Management
// ==================== //
function saveDraft() {
    localStorage.setItem('thoughtDraft', JSON.stringify(currentThought));
}

function loadDraft() {
    const draft = localStorage.getItem('thoughtDraft');
    if (draft) {
        try {
            currentThought = JSON.parse(draft);

            // Restore form values
            if (currentThought.situation) {
                document.getElementById('situation').value = currentThought.situation;
            }
            if (currentThought.thoughts) {
                document.getElementById('thoughts').value = currentThought.thoughts;
            }
            if (currentThought.emotions.length > 0) {
                currentThought.emotions.forEach(emotion => {
                    const checkbox = document.querySelector(`input[name="emotion"][value="${emotion}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            if (currentThought.emotionIntensity) {
                document.getElementById('emotionIntensity').value = currentThought.emotionIntensity;
                document.getElementById('intensityValue').textContent = currentThought.emotionIntensity;
            }
            if (currentThought.distortions.length > 0) {
                currentThought.distortions.forEach(distortion => {
                    const checkbox = document.querySelector(`input[name="distortion"][value="${distortion}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            if (currentThought.evidenceFor) {
                document.getElementById('evidenceFor').value = currentThought.evidenceFor;
            }
            if (currentThought.evidenceAgainst) {
                document.getElementById('evidenceAgainst').value = currentThought.evidenceAgainst;
            }
            if (currentThought.reframe) {
                document.getElementById('reframe').value = currentThought.reframe;
            }
            if (currentThought.beliefRating) {
                document.getElementById('beliefRating').value = currentThought.beliefRating;
                document.getElementById('beliefValue').textContent = currentThought.beliefRating;
            }
        } catch (e) {
            console.error('Error loading draft:', e);
        }
    }
}

// ==================== //
// Mood Tracking
// ==================== //
function selectMood(mood) {
    // Update button states
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.closest('.mood-btn').classList.add('selected');

    // Show details section
    document.getElementById('moodDetails').classList.remove('hidden');

    // Store selected mood
    document.getElementById('moodDetails').dataset.selectedMood = mood;
}

function saveMood() {
    const mood = document.getElementById('moodDetails').dataset.selectedMood;
    const note = document.getElementById('moodNote').value;

    if (!mood) {
        alert('Please select a mood first');
        return;
    }

    // Create mood entry
    const moodEntry = {
        mood: mood,
        note: note,
        timestamp: new Date().toISOString()
    };

    // Get existing moods
    let moods = JSON.parse(localStorage.getItem('moods') || '[]');

    // Add new mood
    moods.unshift(moodEntry);

    // Keep only last 100 moods
    if (moods.length > 100) {
        moods = moods.slice(0, 100);
    }

    // Save to localStorage
    localStorage.setItem('moods', JSON.stringify(moods));

    // Reset form
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById('moodNote').value = '';
    document.getElementById('moodDetails').classList.add('hidden');

    // Reload mood history
    loadMoodHistory();

    // Show confirmation
    alert('Mood check-in saved! 💙');
}

function loadMoodHistory() {
    const moods = JSON.parse(localStorage.getItem('moods') || '[]');
    const moodList = document.getElementById('moodList');

    if (moods.length === 0) {
        moodList.innerHTML = '<p style="color: var(--color-text-light); text-align: center;">No mood check-ins yet. Start tracking your emotional patterns!</p>';
        return;
    }

    const moodEmojis = {
        great: '😊',
        good: '🙂',
        okay: '😐',
        low: '😔',
        struggling: '😢'
    };

    const recentMoods = moods.slice(0, 10);

    moodList.innerHTML = recentMoods.map(entry => {
        const date = new Date(entry.timestamp);
        const formattedDate = formatDate(date);

        return `
            <div class="mood-entry">
                <div class="mood-entry-emoji">${moodEmojis[entry.mood]}</div>
                <div class="mood-entry-content">
                    <div class="mood-entry-mood">${entry.mood}</div>
                    <div class="mood-entry-date">${formattedDate}</div>
                    ${entry.note ? `<div class="mood-entry-note">${entry.note}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ==================== //
// Breathing Exercise
// ==================== //
function startBreathing() {
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const btn = document.getElementById('breathingBtn');

    if (breathingState === 'stopped') {
        breathingState = 'running';
        btn.textContent = 'Stop';
        runBreathingCycle(circle, text);
    } else {
        breathingState = 'stopped';
        btn.textContent = 'Start';
        circle.classList.remove('breathe-in', 'breathe-out');
        text.textContent = 'Click Start';
        if (breathingInterval) {
            clearTimeout(breathingInterval);
        }
    }
}

function runBreathingCycle(circle, text) {
    if (breathingState === 'stopped') return;

    // Breathe in
    circle.classList.remove('breathe-out');
    circle.classList.add('breathe-in');
    text.textContent = 'Breathe in...';

    breathingInterval = setTimeout(() => {
        if (breathingState === 'stopped') return;

        // Hold
        text.textContent = 'Hold...';

        breathingInterval = setTimeout(() => {
            if (breathingState === 'stopped') return;

            // Breathe out
            circle.classList.remove('breathe-in');
            circle.classList.add('breathe-out');
            text.textContent = 'Breathe out...';

            breathingInterval = setTimeout(() => {
                if (breathingState === 'stopped') return;

                // Repeat
                runBreathingCycle(circle, text);
            }, 4000);
        }, 2000);
    }, 4000);
}

// ==================== //
// Affirmations
// ==================== //
const affirmations = [
    "You are doing the best you can with what you know right now.",
    "Your feelings are valid, and it's okay to feel them.",
    "Progress, not perfection, is what matters.",
    "You are stronger than your anxious thoughts.",
    "This moment is temporary. You will get through this.",
    "You deserve compassion, especially from yourself.",
    "It's okay to take breaks and rest when you need to.",
    "Your worth is not determined by your productivity.",
    "You are allowed to change your mind and grow.",
    "Small steps forward are still steps forward.",
    "You don't have to have it all figured out right now.",
    "It's brave to ask for help when you need it.",
    "You are not your thoughts. You are the observer of your thoughts.",
    "Every day is a new opportunity to begin again.",
    "You are worthy of love and belonging, just as you are.",
    "Your mental health matters, and taking care of it is strength.",
    "You have survived 100% of your worst days so far.",
    "Be patient with yourself. Growth takes time.",
    "You are enough, exactly as you are in this moment.",
    "It's okay to not be okay sometimes."
];

function newAffirmation() {
    const affirmationText = document.getElementById('affirmationText');
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    affirmationText.textContent = `"${affirmations[randomIndex]}"`;
}

// ==================== //
// Journal & Stats
// ==================== //
function loadJournal() {
    const records = JSON.parse(localStorage.getItem('thoughtRecords') || '[]');
    const journalList = document.getElementById('journalList');

    if (records.length === 0) {
        journalList.innerHTML = '<p style="color: var(--color-text-light); text-align: center;">No entries yet. Start by untangling a thought!</p>';
        return;
    }

    const recentRecords = records.slice(0, 20);

    journalList.innerHTML = recentRecords.map((record, index) => {
        const date = new Date(record.timestamp);
        const formattedDate = formatDate(date);
        const preview = record.situation ? record.situation.substring(0, 100) + (record.situation.length > 100 ? '...' : '') : 'No situation described';

        return `
            <div class="entry-item" onclick="viewEntry(${index})">
                <div class="entry-header">
                    <div class="entry-type">🧠 Thought Record</div>
                    <div class="entry-date">${formattedDate}</div>
                </div>
                <div class="entry-preview">${preview}</div>
            </div>
        `;
    }).join('');
}

function viewEntry(index) {
    const records = JSON.parse(localStorage.getItem('thoughtRecords') || '[]');
    const record = records[index];

    if (!record) return;

    const distortionNames = {
        'all-or-nothing': 'All-or-Nothing Thinking',
        'catastrophizing': 'Catastrophizing',
        'mind-reading': 'Mind Reading',
        'overgeneralization': 'Overgeneralization',
        'personalization': 'Personalization',
        'should-statements': '"Should" Statements',
        'emotional-reasoning': 'Emotional Reasoning',
        'fortune-telling': 'Fortune Telling'
    };

    const date = new Date(record.timestamp);
    const formattedDate = formatDate(date);

    let message = `📅 ${formattedDate}\n\n`;
    message += `SITUATION:\n${record.situation || 'Not specified'}\n\n`;
    message += `THOUGHTS:\n${record.thoughts || 'Not specified'}\n\n`;
    message += `EMOTIONS (${record.emotionIntensity}/10):\n${record.emotions.length > 0 ? record.emotions.join(', ') : 'Not specified'}\n\n`;

    if (record.distortions.length > 0) {
        message += `THINKING TRAPS:\n`;
        record.distortions.forEach(d => {
            message += `• ${distortionNames[d]}\n`;
        });
        message += '\n';
    }

    if (record.evidenceFor) {
        message += `EVIDENCE FOR:\n${record.evidenceFor}\n\n`;
    }

    if (record.evidenceAgainst) {
        message += `EVIDENCE AGAINST:\n${record.evidenceAgainst}\n\n`;
    }

    message += `BALANCED PERSPECTIVE:\n${record.reframe || 'Not specified'}\n\n`;
    message += `BELIEF RATING: ${record.beliefRating}/10`;

    alert(message);
}

function loadStats() {
    const records = JSON.parse(localStorage.getItem('thoughtRecords') || '[]');
    const moods = JSON.parse(localStorage.getItem('moods') || '[]');

    // Update total entries
    document.getElementById('totalEntries').textContent = records.length;

    // Update total moods
    document.getElementById('totalMoods').textContent = moods.length;

    // Calculate streak
    const streak = calculateStreak(records, moods);
    document.getElementById('streakDays').textContent = streak;
}

function calculateStreak(records, moods) {
    // Combine all timestamps
    const allTimestamps = [
        ...records.map(r => r.timestamp),
        ...moods.map(m => m.timestamp)
    ].sort((a, b) => new Date(b) - new Date(a));

    if (allTimestamps.length === 0) return 0;

    // Check for consecutive days
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check each day backwards
    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(currentDate);
        checkDate.setDate(checkDate.getDate() - i);

        const hasEntry = allTimestamps.some(timestamp => {
            const entryDate = new Date(timestamp);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === checkDate.getTime();
        });

        if (hasEntry) {
            streak = i + 1;
        } else if (i > 0) {
            // If we've already counted some days and hit a gap, stop
            break;
        }
    }

    return streak;
}

// ==================== //
// Data Management
// ==================== //
function exportData() {
    const records = JSON.parse(localStorage.getItem('thoughtRecords') || '[]');
    const moods = JSON.parse(localStorage.getItem('moods') || '[]');

    const data = {
        thoughtRecords: records,
        moods: moods,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `untangle-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
}

function confirmClearData() {
    if (confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
        if (confirm('Really sure? All your thought records and mood check-ins will be permanently deleted.')) {
            localStorage.removeItem('thoughtRecords');
            localStorage.removeItem('moods');
            localStorage.removeItem('thoughtDraft');

            loadJournal();
            loadStats();
            loadMoodHistory();

            alert('All data has been cleared.');
        }
    }
}

// ==================== //
// Utility Functions
// ==================== //
function formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
        return 'Just now';
    } else if (diffMins < 60) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
