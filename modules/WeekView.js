export class WeekView {
    constructor(containerSelector, eventManager) {
        this.container = document.querySelector(containerSelector); // Контейнер для тижневого календаря
        this.eventManager = eventManager;
        this.currentWeek = [];
    }

    setWeekFromDate(date) {
        const selectedDate = new Date(date);
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay() + 1); // Понеділок
        this.setWeek(startOfWeek);

        // Оновлюємо заголовок тижня
        const endDate = new Date(startOfWeek);
        endDate.setDate(startOfWeek.getDate() + 6);
        const headerTitle = document.getElementById('weekHeaderTitle');
        if (headerTitle) {
            headerTitle.textContent = `${startOfWeek.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })} - ${endDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}`;
        }
    }

    setWeek(startDate) {
        this.currentWeek = [];
        const start = new Date(startDate);
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            this.currentWeek.push(day);
        }
    }

    render() {
        // Перевіряємо існування контейнерів
        const weekDaysContainer = this.container.querySelector('#weekDays');
        const weekScheduleContainer = this.container.querySelector('#weekSchedule');
        const timeColumn = this.container.querySelector('#timeColumn');

        if (!weekDaysContainer || !weekScheduleContainer || !timeColumn) {
            console.error("Контейнери weekDays, weekSchedule або timeColumn не знайдені!");
            return;
        }

        weekDaysContainer.innerHTML = '';
        weekScheduleContainer.innerHTML = '';
        timeColumn.innerHTML = '';

        // Відображення часових інтервалів (зліва)
        for (let i = 0; i < 24; i++) {
            const timeRow = document.createElement('div');
            timeRow.className = 'time-row';
            timeRow.textContent = `${String(i).padStart(2, '0')}:00`;
            timeColumn.appendChild(timeRow);
        }

        // Відображення заголовків днів
        this.currentWeek.forEach((day) => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'cell day-header';
            dayHeader.textContent = `${day.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric' })}`;
            weekDaysContainer.appendChild(dayHeader);

            // Додаємо часові слоти для кожного дня
            for (let i = 0; i < 48; i++) {
                const timeCell = document.createElement('div');
                timeCell.className = 'cell time-slot';
                timeCell.dataset.date = day.toISOString().split('T')[0];
                timeCell.dataset.time = this.formatTime(i);

                // Подвійний клік для створення події
                timeCell.addEventListener('dblclick', () => {
                    this.eventManager.openModal({
                        title: '',
                        description: '',
                        duration: 1,
                        startTime: timeCell.dataset.time,
                        date: timeCell.dataset.date,
                    });
                });

                // Drag-and-Drop
                timeCell.addEventListener('dragover', (e) => e.preventDefault());
                timeCell.addEventListener('drop', (e) => this.handleDrop(e, timeCell));

                weekScheduleContainer.appendChild(timeCell);
            }
        });

        // Відображення подій
        this.eventManager.renderWeekEvents(this.currentWeek, weekScheduleContainer);

        // Підсвічування поточного часу
        this.highlightCurrentTime();
    }

    handleDrop(e, cell) {
        e.preventDefault();
        const draggedEvent = JSON.parse(e.dataTransfer.getData('text/plain'));
        this.eventManager.moveEvent(
            draggedEvent.date,
            draggedEvent.time,
            cell.dataset.date,
            cell.dataset.time
        );
        this.render();
    }

    highlightCurrentTime() {
        const now = new Date();
        const isoDate = now.toISOString().split('T')[0];
        const time = `${String(now.getHours()).padStart(2, '0')}:${now.getMinutes() < 30 ? '00' : '30'}`;
        const currentCell = this.container.querySelector(`.time-slot[data-date="${isoDate}"][data-time="${time}"]`);
        if (currentCell) {
            currentCell.classList.add('current-time');
        }
    }

    formatTime(index) {
        const hours = Math.floor(index / 2);
        const minutes = index % 2 === 0 ? '00' : '30';
        return `${String(hours).padStart(2, '0')}:${minutes}`;
    }
}
