let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let startTime;
let timerInterval;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const recordedVideo = document.getElementById('recordedVideo');
const timerDisplay = document.getElementById('timer');
const themeToggle = document.getElementById('themeToggle');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const batteryStatus = document.getElementById('batteryStatus');
const timeDisplay = document.getElementById('time');

startBtn.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
    });

    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        recordedVideo.src = URL.createObjectURL(blob);
        recordedChunks = [];
        stopTimer();  // Parar o cronômetro quando a gravação terminar
    };

    mediaRecorder.start();
    isRecording = true;
    startTime = Date.now();
    startTimer();  // Iniciar o cronômetro
    toggleRecordingUI();
});

stopBtn.addEventListener('click', () => {
    // Ao clicar em "Stop", vamos parar o gravador manualmente
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    }
    // Não vamos desabilitar a gravação se o usuário não pressionar explicitamente
});

const toggleRecordingUI = () => {
    if (isRecording) {
        startBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
    } else {
        startBtn.classList.remove('hidden');
        stopBtn.classList.add('hidden');
    }
};

const startTimer = () => {
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const seconds = Math.floor(elapsedTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        timerDisplay.textContent = `${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
    }, 1000);
};

const stopTimer = () => {
    clearInterval(timerInterval);  // Parar o cronômetro
};

const showPlayer = () => {
    recordedVideo.classList.remove('hidden');  // Mostrar o player de vídeo abaixo
};

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});

copyBtn.addEventListener('click', () => {
    const url = recordedVideo.src;
    navigator.clipboard.writeText(url).then(() => {
        alert('URL copied to clipboard!');
    });
});

downloadBtn.addEventListener('click', () => {
    const url = recordedVideo.src;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recorded_video.webm';
    a.click();
});

navigator.getBattery().then(battery => {
    const updateBatteryStatus = () => {
        batteryStatus.textContent = `Battery: ${Math.round(battery.level * 100)}%`;
    };

    battery.addEventListener('levelchange', updateBatteryStatus);
    updateBatteryStatus();
});

setInterval(() => {
    const time = new Date();
    timeDisplay.textContent = `Time: ${time.toLocaleTimeString()}`;
}, 1000);

// Mostrar o player automaticamente após a gravação
recordedVideo.addEventListener('load', showPlayer);
