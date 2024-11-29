const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getEvents: () => ipcRenderer.invoke('get-events'),
    saveEvents: (events) => ipcRenderer.invoke('save-events', events)
});
