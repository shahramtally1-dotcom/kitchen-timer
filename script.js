const display = document.getElementById("display");
const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("seconds");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const message = document.getElementById("message");
const presetButtons = document.querySelectorAll(".presets button");

let totalSeconds = 0;
let timer = null;
let isRunning = false;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainingSeconds).padStart(2, "0")
  );
}

function updateDisplay() {
  display.textContent = formatTime(totalSeconds);
}

function getInputSeconds() {
  let minutes = Number(minutesInput.value) || 0;
  let seconds = Number(secondsInput.value) || 0;

  minutes = Math.max(0, Math.min(99, minutes));
  seconds = Math.max(0, Math.min(59, seconds));

  minutesInput.value = minutes;
  secondsInput.value = seconds;

  return minutes * 60 + seconds;
}

function startTimer() {
  if (isRunning) return;

  // If the timer is at zero, use the values entered by the user.
  if (totalSeconds === 0) {
    totalSeconds = getInputSeconds();
    updateDisplay();
  }

  if (totalSeconds <= 0) {
    message.textContent = "Please set a time first.";
    return;
  }

  message.textContent = "";
  isRunning = true;

  timer = setInterval(() => {
    totalSeconds--;
    updateDisplay();

    if (totalSeconds <= 0) {
      finishTimer();
    }
  }, 1000);
}

function pauseTimer() {
  if (!isRunning) return;

  clearInterval(timer);
  timer = null;
  isRunning = false;
  message.textContent = "Timer paused.";
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  isRunning = false;

  totalSeconds = getInputSeconds();
  updateDisplay();
  message.textContent = "";
}

function finishTimer() {
  clearInterval(timer);
  timer = null;
  isRunning = false;
  totalSeconds = 0;
  updateDisplay();
  message.textContent = "⏰ Time's up!";

  playAlarm();
}

function playAlarm() {
  // Create a short beep using the browser's Web Audio API.
  // No external sound file or API is required.
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) return;

  const audioContext = new AudioContext();

  function beep(startTime, frequency) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.25, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.35);
  }

  const now = audioContext.currentTime;
  beep(now, 880);
  beep(now + 0.4, 660);
  beep(now + 0.8, 880);
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

minutesInput.addEventListener("input", () => {
  if (!isRunning) {
    totalSeconds = getInputSeconds();
    updateDisplay();
  }
});

secondsInput.addEventListener("input", () => {
  if (!isRunning) {
    totalSeconds = getInputSeconds();
    updateDisplay();
  }
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    clearInterval(timer);
    timer = null;
    isRunning = false;

    minutesInput.value = button.dataset.minutes;
    secondsInput.value = button.dataset.seconds;

    totalSeconds = getInputSeconds();
    updateDisplay();
    message.textContent = "Preset selected. Press Start.";
  });
});

updateDisplay();
