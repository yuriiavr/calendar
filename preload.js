const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveEvent: (event) => ipcRenderer.send('save-event', event),
    loadEvents: () => ipcRenderer.invoke('load-events')
});
