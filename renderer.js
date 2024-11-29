import { Calendar } from './modules/Calendar.js';
import { WeekView } from './modules/WeekView.js';
import { EventManager } from './modules/EventManager.js';

// Ініціалізація
const events = {
    plans: {
        '2024-11-25': {
            '10:00': [{ title: 'Подія 1', description: 'Опис 1', duration: 1 }],
            '14:00': [{ title: 'Подія 2', description: 'Опис 2', duration: 2 }]
        }
    },
    holidays: {
        '2024-12-25': ['Різдво']
    }
};

const eventManager = new EventManager(events);
const weekView = new WeekView('#weekView', eventManager);
const calendar = new Calendar(events);

// Рендер місячного календаря
document.addEventListener('DOMContentLoaded', () => {
    const monthView = document.getElementById('monthView');
    const weekHeader = document.getElementById('weekHeader');

    // Завантаження місячного календаря
    calendar.createMonthCalendar();

    // Кнопки навігації
    document.getElementById('prevMonth').addEventListener('click', () => {
        calendar.currentMonth.setMonth(calendar.currentMonth.getMonth() - 1);
        calendar.createMonthCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        calendar.currentMonth.setMonth(calendar.currentMonth.getMonth() + 1);
        calendar.createMonthCalendar();
    });

    // Повернення до місячного календаря
    document.getElementById('backToMonth').addEventListener('click', () => {
        showMonthView();
    });

    // Модальне вікно створення подій
    const saveEventButton = document.getElementById('saveEvent');
    const cancelEventButton = document.getElementById('cancelEvent');
    saveEventButton.addEventListener('click', () => {
        const titleInput = document.getElementById('eventTitle');
        const descriptionInput = document.getElementById('eventDescription');
        const durationInput = document.getElementById('eventDuration');

        const selectedCell = document.querySelector('.selected-cell');
        if (!selectedCell) {
            console.error('Selected cell not found!');
            return;
        }

        const date = selectedCell.closest('.day-column').dataset.date;
        const time = selectedCell.dataset.time;

        const eventTitle = titleInput.value.trim();
        const eventDescription = descriptionInput.value.trim();
        const eventDuration = parseInt(durationInput.value, 10) || 1;

        if (!eventTitle) {
            alert('Назва події не може бути порожньою!');
            return;
        }

        if (!events.plans[date]) events.plans[date] = {};
        if (!events.plans[date][time]) events.plans[date][time] = [];

        events.plans[date][time].push({
            title: eventTitle,
            description: eventDescription,
            duration: eventDuration
        });

        // Оновлення тижневого перегляду
        weekView.renderWeekSchedule(new Date(date));

        closeEventModal();
    });

    cancelEventButton.addEventListener('click', closeEventModal);
});

// Функція закриття модального вікна
function closeEventModal() {
    const modal = document.getElementById('eventModal');
    if (modal) modal.classList.add('hidden');
}

// Показати місячний перегляд
function showMonthView() {
    const weekViewContainer = document.getElementById('weekView');
    const weekHeader = document.getElementById('weekHeader');
    const monthView = document.getElementById('monthView');
    const calendarHeader = document.getElementById('calendarHeader');

    // Приховуємо тижневий календар
    weekViewContainer.classList.add('hidden');
    weekHeader.classList.add('hidden');

    // Показуємо місячний календар
    monthView.classList.remove('hidden');
    calendarHeader.classList.remove('hidden');
}

