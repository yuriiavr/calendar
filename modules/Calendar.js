export class Calendar {
    constructor(events = { plans: {}, holidays: {} }) {
        this.currentMonth = new Date(); // Ініціалізуємо поточний місяць
        this.events = events; // Об'єкт подій
    }

    createMonthCalendar() {
        const monthView = document.getElementById('monthView');
        if (!monthView) {
            console.error('Елемент #monthView не знайдено!');
            return;
        }

        monthView.innerHTML = ''; // Очищуємо попередній вміст

        const header = document.createElement('div');
        header.classList.add('header');
        ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].forEach(day => {
            const dayCell = document.createElement('div');
            dayCell.textContent = day;
            header.appendChild(dayCell);
        });
        monthView.appendChild(header);

        const firstDayOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
        const lastDayOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

        const firstWeekday = firstDayOfMonth.getDay() || 7;
        const totalDays = lastDayOfMonth.getDate();

        let dayCounter = 1;

        // Порожні клітинки для попереднього місяця
        for (let i = 1; i < firstWeekday; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('cell');
            monthView.appendChild(emptyCell);
        }

        // Дні поточного місяця
        while (dayCounter <= totalDays) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            const cellDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), dayCounter);
            const isoDate = cellDate.toISOString().split('T')[0];

            cell.dataset.date = isoDate;
            cell.textContent = dayCounter;

            // Відображення подій
            if (this.events.plans[isoDate]) {
                cell.classList.add('event-day');
                this.events.plans[isoDate].forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('event');
                    eventDiv.textContent = event.title;
                    cell.appendChild(eventDiv);
                });
            }

            // Виділення поточного дня
            if (isoDate === new Date().toISOString().split('T')[0]) {
                cell.classList.add('today');
            }

            // Перехід до тижневого перегляду
            cell.addEventListener('click', () => this.openWeekView(isoDate));
            monthView.appendChild(cell);

            dayCounter++;
        }
    }

    openWeekView(date) {
        const weekViewContainer = document.getElementById('weekView');
        const monthView = document.getElementById('monthView');
        const weekHeader = document.getElementById('weekHeader');

        if (!weekViewContainer || !monthView || !weekHeader) {
            console.error('Елементи для тижневого перегляду не знайдено!');
            return;
        }

        // Ховаємо місячний календар
        monthView.classList.add('hidden');
        weekHeader.classList.remove('hidden');

        // Показуємо тижневий перегляд
        weekViewContainer.classList.remove('hidden');

        const startOfWeek = new Date(date);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Початок тижня (понеділок)

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Кінець тижня

        // Оновлюємо заголовок тижня
        weekHeader.textContent = `${startOfWeek.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })} - ${endOfWeek.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}`;

        // Генерація тижневого розкладу
        this.renderWeekSchedule(startOfWeek);
    }

    renderWeekSchedule(startOfWeek) {
        const weekSchedule = document.getElementById('weekSchedule');
        if (!weekSchedule) {
            console.error('Елемент #weekSchedule не знайдено!');
            return;
        }

        weekSchedule.innerHTML = ''; // Очищуємо попередній розклад

        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }

        // Створюємо колонки для кожного дня
        days.forEach(day => {
            const column = document.createElement('div');
            column.classList.add('day-column');
            column.dataset.date = day.toISOString().split('T')[0];

            const header = document.createElement('div');
            header.classList.add('day-header');
            header.textContent = day.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric' });

            column.appendChild(header);

            // Додаємо клітинки часу
            for (let hour = 0; hour < 24; hour++) {
                const cell = document.createElement('div');
                cell.classList.add('time-cell');
                cell.dataset.time = `${String(hour).padStart(2, '0')}:00`;
                cell.addEventListener('dblclick', () => this.createEvent(cell));
                column.appendChild(cell);
            }

            weekSchedule.appendChild(column);
        });
    }

    createEvent(cell) {
        const date = cell.closest('.day-column').dataset.date;
        const time = cell.dataset.time;

        const eventTitle = prompt('Назва події:');
        if (!eventTitle) return;

        const duration = parseInt(prompt('Тривалість у годинах:', '1'), 10) || 1;

        if (!this.events.plans[date]) this.events.plans[date] = {};
        if (!this.events.plans[date][time]) this.events.plans[date][time] = [];

        this.events.plans[date][time].push({
            title: eventTitle,
            duration,
        });

        // Оновлюємо розклад
        this.renderWeekSchedule(new Date(date));
    }
}
