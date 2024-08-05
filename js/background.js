let frequency = 1800000; // Default to 30 minutes (low)
let dhikrList = ['سبحان الله', 'الحمد لله', 'لا إله إلا الله', 'الله أكبر', 'لا حول ولا قوة إلا بالله', 'اللهم صل وسلم على نبينا محمد'];
let isRunning = false;

function showNotification() {
  console.log('Attempting to show notification');
  const randomDhikr = dhikrList[Math.floor(Math.random() * dhikrList.length)];
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../img/muslim.png',
    title: 'ذكر',
    message: randomDhikr
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error('Notification error:', chrome.runtime.lastError);
    } else {
      console.log('Notification created with ID:', notificationId);
    }
  });
}

function createAlarm() {
  chrome.alarms.create('dhikrAlarm', { periodInMinutes: frequency / 60000 });
  console.log('Alarm created with frequency:', frequency, 'ms');
}

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm triggered:', alarm.name);
  if (alarm.name === 'dhikrAlarm') {
    showNotification();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  if (request.action === 'toggleReminder') {
    isRunning = request.isRunning;
    console.log('Toggled reminder, isRunning:', isRunning);
    if (isRunning) {
      createAlarm();
    } else {
      chrome.alarms.clear('dhikrAlarm');
    }
  } else if (request.action === 'setFrequency') {
    frequency = request.frequency;
    console.log('Set frequency:', frequency);
    if (isRunning) {
      createAlarm();
    }
  } else if (request.action === 'updateDhikrList') {
    dhikrList = request.dhikrList;
    console.log('Updated dhikr list:', dhikrList);
  }
});

// Load saved state and initialize
chrome.storage.sync.get(['isRunning', 'frequency', 'dhikrList'], (result) => {
  console.log('Loaded state:', result);
  if (result.isRunning !== undefined) isRunning = result.isRunning;
  if (result.frequency !== undefined) frequency = result.frequency;
  if (result.dhikrList !== undefined) dhikrList = result.dhikrList;

  if (isRunning) {
    createAlarm();
  }
});

// Request notification permission
chrome.runtime.onInstalled.addListener(() => {
  chrome.permissions.request({
    permissions: ['notifications']
  }, (granted) => {
    console.log('Notification permission granted:', granted);
    if (granted) {
      console.log('Showing test notification after permission grant');
      showNotification();
    }
  });
});

// Log when the background script is loaded
console.log('Background script loaded');