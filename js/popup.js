let frequency = 1800000; // Default to 30 minutes (low)
let dhikrList = ['سبحان الله', 'الحمد لله', 'لا إله إلا الله', 'الله أكبر', 'لا حول ولا قوة إلا بالله', 'اللهم صل وسلم على نبينا محمد'];
let isRunning = false;

const toggleBtn = document.getElementById('toggleBtn');
const lowBtn = document.getElementById('lowBtn');
const mediumBtn = document.getElementById('mediumBtn');
const highBtn = document.getElementById('highBtn');
const settingsBtn = document.getElementById('settingsBtn');
const backBtn = document.getElementById('backBtn');
const mainView = document.getElementById('mainView');
const settingsView = document.getElementById('settingsView');
const dhikrListElement = document.getElementById('dhikrList');
const addDhikrForm = document.getElementById('addDhikrForm');
const developerInfo = document.getElementById('developerInfo');
const closeDeveloperInfo = document.getElementById('closeDeveloperInfo');


function toggleReminder() {
    isRunning = !isRunning;
    toggleBtn.textContent = isRunning ? 'إيقاف' : 'تشغيل';
    toggleBtn.classList.toggle('bg-blue-500');
    toggleBtn.classList.toggle('bg-red-500');
    chrome.runtime.sendMessage({ action: 'toggleReminder', isRunning: isRunning });
    saveState();
}

function setFrequency(freq) {
    frequency = freq;
    [lowBtn, mediumBtn, highBtn].forEach(btn => btn.classList.remove('bg-green-500', 'text-black'));
    switch(freq) {
        case 1800000: // 30 minutes
            lowBtn.classList.add('bg-green-500', 'text-black');
            break;
        case 900000: // 15 minutes
            mediumBtn.classList.add('bg-green-500', 'text-black');
            break;
        case 420000: // 7 minutes
            highBtn.classList.add('bg-green-500', 'text-black');
            break;
    }
    chrome.runtime.sendMessage({ action: 'setFrequency', frequency: frequency });
    saveState();
}

function toggleView() {
    mainView.classList.toggle('hidden');
    settingsView.classList.toggle('hidden');
    if (!settingsView.classList.contains('hidden')) {
        renderDhikrList();
    }
}

function renderDhikrList() {
    dhikrListElement.innerHTML = '';
    dhikrList.forEach((dhikr, index) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center bg-white p-2 mb-2 rounded shadow';
        li.innerHTML = `
            <span>${dhikr}</span>
            <button class="delete-btn text-red-500 hover:text-red-700">حذف</button>
        `;
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteDhikr(index));
        dhikrListElement.appendChild(li);
    });
}

function addDhikr(event) {
    event.preventDefault();
    const newDhikr = document.getElementById('newDhikr').value;
    if (newDhikr && !dhikrList.includes(newDhikr)) {
        dhikrList.push(newDhikr);
        renderDhikrList();
        document.getElementById('newDhikr').value = '';
        updateDhikrList();
    }
}

function deleteDhikr(index) {
    dhikrList.splice(index, 1);
    renderDhikrList();
    updateDhikrList();
}

function updateDhikrList() {
    chrome.runtime.sendMessage({ action: 'updateDhikrList', dhikrList: dhikrList });
    saveState();
}

function showDeveloperInfo() {
    developerInfo.classList.remove('hidden');
}

function hideDeveloperInfo() {
    developerInfo.classList.add('hidden');
}

function saveState() {
    chrome.storage.sync.set({ isRunning, frequency, dhikrList });
}

// Event Listeners
toggleBtn.addEventListener('click', toggleReminder);
lowBtn.addEventListener('click', () => setFrequency(1800000)); // 30 minutes
mediumBtn.addEventListener('click', () => setFrequency(900000)); // 15 minutes
highBtn.addEventListener('click', () => setFrequency(420000)); // 7 minutes
settingsBtn.addEventListener('click', toggleView);
backBtn.addEventListener('click', toggleView);
developerBtn.addEventListener('click', showDeveloperInfo);
closeDeveloperInfo.addEventListener('click', hideDeveloperInfo);
addDhikrForm.addEventListener('submit', addDhikr);

// Initialize
chrome.storage.sync.get(['isRunning', 'frequency', 'dhikrList'], (result) => {
    if (result.isRunning !== undefined) isRunning = result.isRunning;
    if (result.frequency !== undefined) frequency = result.frequency;
    if (result.dhikrList !== undefined) dhikrList = result.dhikrList;

    toggleBtn.textContent = isRunning ? 'إيقاف' : 'تشغيل';
    toggleBtn.classList.toggle('bg-red-500', isRunning);
    setFrequency(frequency);
    renderDhikrList();
});