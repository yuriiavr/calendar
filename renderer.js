document.querySelector('#addEventForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const event = {
        title: document.querySelector('#eventTitle').value,
        date: document.querySelector('#eventDate').value,
        description: document.querySelector('#eventDescription').value
    };
    window.electronAPI.saveEvent(event);
});
