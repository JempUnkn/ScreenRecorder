let mediaRecorder;
let recordedChunks = [];
let startTime;
let timerInterval


let includeSystemAudio = true; // Controla áudio do sistema


const timeElapsed = document.getElementById('timeElapsed');
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
const audioToggle = document.getElementById('audioToggle'); // Botão para áudio do sistema





const startTimer = () => {
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const seconds = Math.floor(elapsedTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        timerDisplay.textContent = `${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
    }, 1000);
};

// Função para formatar o tempo decorrido
function formatTime(elapsedTime) {
    const date = new Date(elapsedTime);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Atualizar o tempo decorrido
function updateTime() {
    const elapsedTime = Date.now() - startTime;
    timeElapsed.textContent = formatTime(elapsedTime);
}


startBtn.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: includeSystemAudio, // Inclui áudio do sistema
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

    // Ao começar a gravação, inicia o cronômetro
    startTime = Date.now();
    timerInterval = setInterval(updateTime, 1000);

    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    toggleRecordingUI();
});



// Botão para ativar/desativar áudio do sistema
audioToggle.addEventListener('click', () => {
    includeSystemAudio = !includeSystemAudio;
    audioToggle.textContent = includeSystemAudio ? '🟢 Áudio Ativado' : '🔴 Áudio Desativado';
});



function closeSharingWindow() {
    if (sharingWindow) {
        sharingWindow.remove(); // Remove o elemento do DOM
    }
}
stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();  // Isso deve parar a gravação
        startBtn.disabled = false;
        stopBtn.disabled = true;
        // Mostrar o popup e o vídeo gravado
        popupContent.style.display = 'grid';
        // Fechar a janela do Compartilhamento de Tela
        closeSharingWindow();
    }
});
stopBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    popupContent.style.display = 'grid';
    // Fechar a janela do Compartilhamento de Tela
    closeSharingWindow();
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
    popupContent.style.display = 'grid';  // Mostrar o popup
    console.log('Tempo final do vídeo:', recordedVideo.duration);
    clearInterval(timerInterval);
});
