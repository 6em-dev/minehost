// 🔥 REPLACE THIS WITH YOUR RAILWAY URL FROM STEP 2.3
const BACKEND_URL = 'https://YOUR_RAILWAY_URL.up.railway.app';

// Connect to backend
const socket = io(BACKEND_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
});

const consoleLog = document.getElementById('console-log');
const statusBadge = document.getElementById('status-indicator');
let usageCount = parseInt(localStorage.getItem('mineHostUsage')) || 0;
const UNLOCK_THRESHOLD = 5;

updateUI();

// Connection handlers
socket.on('connect', () => {
    console.log('✅ Connected to backend');
    statusBadge.textContent = 'ONLINE';
    statusBadge.className = 'status online';
    addLog('> ✅ Connected to MineHost backend', 'success');
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from backend');
    statusBadge.textContent = 'OFFLINE';
    statusBadge.className = 'status error';
    addLog('> ⚠️ Lost connection to backend', 'error');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    statusBadge.textContent = 'CONNECTION ERROR';
    statusBadge.className = 'status error';
    addLog('> ❌ Failed to connect to backend', 'error');
});

// Server logs
socket.on('console-log', (msg) => {
    addLog(msg.trim());
});

function addLog(message, type = 'normal') {
    const line = document.createElement('div');
    line.textContent = message;
    
    if (type === 'error') {
        line.style.color = '#ff5252';
    } else if (type === 'success') {
        line.style.color = '#4caf50';
    }
    
    consoleLog.appendChild(line);
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

function startServer() {
    if (!socket.connected) {
        addLog('> ❌ Not connected to backend! Check your connection.', 'error');
        return;
    }
    
    addLog('> 📡 Sending start command to backend...');
    socket.emit('start-server');
    addUsage();
}

function stopServer() {
    if (!socket.connected) {
        addLog('> ❌ Not connected to backend!', 'error');
        return;
    }
    
    addLog('> 📡 Sending stop command...');
    socket.emit('stop-server');
    addUsage();
}

function addUsage() {
    if (usageCount < UNLOCK_THRESHOLD) {
        usageCount++;
        localStorage.setItem('mineHostUsage', usageCount);
        updateUI();
    }
}

function updateUI() {
    const progress = Math.min((usageCount / UNLOCK_THRESHOLD) * 100, 100);
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    const statusText = document.getElementById('access-status');
    const xpText = document.getElementById('xp-text');

    if (usageCount >= UNLOCK_THRESHOLD) {
        statusText.innerText = "UNLOCKED 🔓";
        statusText.style.color = "#4caf50";
        xpText.innerText = "Browser access unlocked!";
    } else {
        xpText.innerText = `${UNLOCK_THRESHOLD - usageCount} more actions to unlock full browser access 🔥`;
    }
}

function downloadConfig() {
    const content = `# MineHost Server Configuration
server-port=25565
gamemode=survival
motd=§6Welcome to §bMineHost §7| §alamps-dev.dev
max-players=20
online-mode=true
difficulty=normal
pvp=true
enable-command-block=false
spawn-protection=16
view-distance=10`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'server.properties';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addLog('> 📥 Configuration file downloaded!', 'success');
}