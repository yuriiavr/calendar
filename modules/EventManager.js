export class EventManager {

    hasEvents(date) {
        return this.events[date] && this.events[date].length > 0;
    }

    constructor() {
        this.events = {};
    }

    loadEvents(events) {
        this.events = events;
    }

    addEvent(date, time, duration, title, description) {
        if (!this.events[date]) this.events[date] = [];
        this.events[date].push({ time, duration, title, description });
    }

    moveEvent(oldDate, oldTime, newDate, newTime) {
        const eventIndex = this.events[oldDate]?.findIndex(
            (event) => event.time === oldTime
        );

        if (eventIndex !== -1) {
            const [event] = this.events[oldDate].splice(eventIndex, 1);
            event.time = newTime;
            if (!this.events[newDate]) this.events[newDate] = [];
            this.events[newDate].push(event);

            if (this.events[oldDate].length === 0) delete this.events[oldDate];
        }
    }

    renderWeekEvents(weekDates, container) {
        weekDates.forEach((day) => {
            const isoDate = day.toISOString().split('T')[0];
            const dayEvents = this.events[isoDate] || [];

            dayEvents.forEach((event) => {
                const startCell = container.querySelector(
                    `.cell[data-date="${isoDate}"][data-time="${event.time}"]`
                );

                if (startCell) {
                    const eventDiv = document.createElement('div');
                    eventDiv.className = 'event';
                    eventDiv.textContent = event.title;
                    eventDiv.style.height = `${event.duration * 50}px`;
                    eventDiv.draggable = true;

                    // Drag-and-Drop
                    eventDiv.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData(
                            'text/plain',
                            JSON.stringify({ date: isoDate, time: event.time })
                        );
                    });

                    // Розширення події
                    eventDiv.addEventListener('mousedown', (e) => {
                        if (e.target.classList.contains('resize-handle')) {
                            this.startResizing(e, event, isoDate);
                        }
                    });

                    startCell.appendChild(eventDiv);
                }
            });
        });
    }

    openModal(eventData) {
        const modal = document.getElementById('eventModal');
        const titleInput = document.getElementById('eventTitle');
        const descriptionInput = document.getElementById('eventDescription');
        const durationInput = document.getElementById('eventDuration');
    
        if (!modal || !titleInput || !descriptionInput || !durationInput) {
            console.error('Modal elements are missing in the DOM');
            return;
        }
    
        // Встановлюємо значення полів
        titleInput.value = eventData.title || '';
        descriptionInput.value = eventData.description || '';
        durationInput.value = eventData.duration || 1;
    
        // Показуємо модальне вікно
        modal.classList.remove('hidden');
    }
}
