const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false
        }
    });

    mainWindow.loadFile('index.html');
});

ipcMain.handle('get-events', async () => {
    const filePath = path.join(__dirname, 'data', 'events.json');
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}));
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
});

ipcMain.handle('save-events', async (_, events) => {
    const filePath = path.join(__dirname, 'data', 'events.json');
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
    return true;
});
