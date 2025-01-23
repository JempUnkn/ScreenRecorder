let mediaRecorder;
let recordedChunks = [];
let startTime;
let timerInterval


const timeElapsed = document.getElementById('timeElapsed')
const popupContent = document.getElementById('popupContent');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const recordedVideo = document.getElementById('recordedVideo');
const timerDisplay = document.getElementById('timer');
const themeToggle = document.getElementById('themeToggle');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const batteryStatus = document.getElementById('batteryStatus');
const timeDisplay = document.getElementById('time');





const startTimer = () => {
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const seconds = Math.floor(elapsedTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        timerDisplay.textContent = `${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
    }, 1000);
};




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
    };

    // Para o cronômetro ao parar a gravação
    clearInterval(timerInterval);

    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    startTime = Date.now();
    startTimer();  // Iniciar o cronômetro
    toggleRecordingUI();
    
    // Inicia o cronômetro
    timerInterval = setInterval(updateTime, 1000);
});

stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();  // Isso deve parar a gravação
        startBtn.disabled = false;
        stopBtn.disabled = true;
        
        // Mostrar o popup e o vídeo gravado
        popupContent.style.display = 'block';
    }
});





stopBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    
    
    
    // Mostrar o popup e o vídeo gravado
    popupContent.style.display = 'block';
});


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
    const batteryElement = document.getElementById('batteryStatus');
    const charging = battery.charging ? '⚡ Carregando' : '🔌 Desconectado';
    const updateBatteryStatus = () => {
        batteryStatus.textContent = `Status Battery: ${charging}`;
        batteryStatus.textContent = `Battery: ${Math.round(battery.level * 100)}% 🔋`;
    };

    battery.addEventListener('levelchange', updateBatteryStatus);
    updateBatteryStatus();
}, setInterval(updateBatteryStatus, 5000));

function updateBatteryStatus() {
    navigator.getBattery().then(battery => {
        const batteryElement = document.getElementById('batteryStatus');
        const level = battery.level * 100;
        const charging = battery.charging ? '⚡ Carregando' : '🔌 Desconectado';
        batteryElement.textContent = `Status Battery: ${charging}`;
        batteryElement.textContent = `Battery: ${level}% 🔋`;
    });
}
setInterval(updateBatteryStatus, 5000);


setInterval(() => {
    const time = new Date();
    timeDisplay.textContent = `Time: ${time.toLocaleTimeString()} 🕒`;
}, 1000);


/// -------------

// Verificar quando o vídeo estiver pronto
recordedVideo.addEventListener('canplaythrough', () => {
    startBtn.disabled = false;  // Desabilitar o botão de Start
    stopBtn.disabled = true;  // Habilitar o botão de Stop
    popupContent.style.display = 'block';  // Mostrar o popup
});

function updateTime() {
    const elapsedTime = Date.now() - startTime;
    const date = new Date(elapsedTime);

    // Formatando o tempo como A%M%S%D%H%M%S
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const days = String(Math.floor(elapsedTime / (1000 * 60 * 60 * 24))).padStart(2, '0');
    const years = String(Math.floor(elapsedTime / (1000 * 60 * 60 * 24 * 365.25))).padStart(4, '0');

    timeElapsed.textContent = `${years}:${days}:${hours}:${minutes}:${seconds}`;
}

recordedVideo.addEventListener('loadedmetadata', () => {
    // Quando o vídeo estiver pronto para ser reproduzido
    if (popupContent.style.display === 'block') {
        // Exibe o tempo final do vídeo
        clearInterval(timerInterval);
    }
});