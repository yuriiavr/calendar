// === ГЛОБАЛЬНІ ЗМІННІ ТА НАЛАШТУВАННЯ ===

const monthView = document.getElementById('monthView'); // Місячний календар
const dayView = document.getElementById('dayView'); // Розклад дня
const monthCalendar = document.getElementById('monthCalendar'); // Таблиця місячного календаря
const daySchedule = document.getElementById('daySchedule').querySelector('tbody'); // Розклад дня
const backToMonthButton = document.getElementById('backToMonth'); // Кнопка "Назад до місяця"
const prevMonthButton = document.getElementById('prevMonth'); // Кнопка "Попередній місяць"
const nextMonthButton = document.getElementById('nextMonth'); // Кнопка "Наступний місяць"
const currentMonthLabel = document.getElementById('currentMonth'); // Поточний місяць
const modal = document.getElementById('eventModal'); // Модальне вікно
const saveEventButton = document.getElementById('saveEvent'); // Кнопка "Зберегти подію"
const cancelEventButton = document.getElementById('cancelEvent'); // Кнопка "Скасувати подію"
const eventDescriptionInput = document.getElementById('eventDescription'); // Поле введення опису події
const eventTypeSelect = document.getElementById('eventType'); // Вибір типу події
const today = new Date();
const events = {
    plans: {},
    holidays: {}
};
let selectedDate = null; // Вибраний день для перегляду
let currentMonth = new Date(today.getFullYear(), today.getMonth()); // Поточний місяць
let isDayModeEnabled = JSON.parse(localStorage.getItem('dayMode')) || false; // Стан денного режиму
const contextMenu = document.getElementById('contextMenu'); // Контекстне меню
let selectedEventCell = null; // Поточна обрана клітинка події
let userTimezone = localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

// === МІСЯЧНИЙ КАЛЕНДАР ===

// Створення місячного календаря
function createMonthCalendar() {
    const tbody = monthCalendar.querySelector('tbody');
    tbody.innerHTML = '';

    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const firstWeekday = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    currentMonthLabel.textContent = firstDayOfMonth.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });

    let dayCounter = 1;
    let row = document.createElement('tr');

    // Додаємо порожні клітинки для попередніх днів
    for (let i = 1; i < firstWeekday; i++) {
        const emptyCell = document.createElement('td');
        row.appendChild(emptyCell);
    }

    // Додаємо дні місяця
    for (let i = firstWeekday; i <= 7; i++) {
        const cell = createMonthCell(dayCounter++);
        row.appendChild(cell);
    }

    tbody.appendChild(row);

    // Додаємо решту днів місяця
    while (dayCounter <= totalDays) {
        row = document.createElement('tr');
        for (let i = 1; i <= 7 && dayCounter <= totalDays; i++) {
            const cell = createMonthCell(dayCounter++);
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }
}

// Створення клітинки дня
function createMonthCell(day) {
    const cell = document.createElement('td');
    cell.textContent = day;

    const cellDate = getDateInTimezone(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), userTimezone);
    const today = getDateInTimezone(new Date(), userTimezone);

    // Підсвічення сьогоднішньої дати
    if (
        cellDate.getFullYear() === today.getFullYear() &&
        cellDate.getMonth() === today.getMonth() &&
        cellDate.getDate() === today.getDate()
    ) {
        cell.style.backgroundColor = 'green';
        cell.style.color = 'white';
    }

    // Відображення свят
    const isoDate = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
    if (events.holidays[isoDate]) {
        const holidayDiv = document.createElement('div');
        holidayDiv.textContent = `🎉 ${events.holidays[isoDate].join(', ')}`;
        holidayDiv.style.fontSize = '12px';
        holidayDiv.style.color = 'red';
        cell.appendChild(holidayDiv);
    }

    // Перехід до детального розкладу дня
    cell.addEventListener('click', () => showDayView(isoDate));
    return cell;
}


// === КЕРУВАННЯ МІСЯЦЕМ ===

// Перегортання місяця назад
function prevMonth() {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    createMonthCalendar();
}

// Перегортання місяця вперед
function nextMonth() {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    createMonthCalendar();
}

// === ДЕТАЛЬНИЙ РОЗКЛАД ДНЯ ===

// Показ розкладу дня
function showDayView(date) {
    selectedDate = date;
    monthView.style.display = 'none';
    dayView.style.display = 'block';
    document.getElementById('selectedDate').textContent = new Date(date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
    createDaySchedule(date);
    scrollToCurrentTime();
}

// Повернення до місячного календаря
backToMonthButton.addEventListener('click', () => {
    dayView.style.display = 'none';
    monthView.style.display = 'block';
    selectedDate = null;
});

// Створення розкладу дня
function createDaySchedule(date) {
    daySchedule.innerHTML = '';

    for (let hour = 0; hour < 24; hour++) {
        for (let minutes = 0; minutes < 60; minutes += 30) {
            const row = document.createElement('tr');
            const timeCell = document.createElement('td');
            timeCell.textContent = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            timeCell.classList.add('time-label');

            const eventCell = document.createElement('td');
            eventCell.dataset.date = date;
            eventCell.dataset.time = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            eventCell.addEventListener('dblclick', () => addEventByClick(eventCell));
            eventCell.addEventListener('contextmenu', (e) => openContextMenu(e, eventCell));
            document.addEventListener('click', (e) => {
                if (modal.style.display === 'block' && !modal.contains(e.target) && e.target !== saveEventButton && e.target !== cancelEventButton) {
                    closeEventModal();
                }
            });

            // Відображення планів
            if (events.plans[date] && events.plans[date][eventCell.dataset.time]) {
                events.plans[date][eventCell.dataset.time].forEach(event => {
                    const span = document.createElement('span');
                    span.textContent = event;
                    span.style.display = 'block';
                    eventCell.appendChild(span);
                });
            }

            row.appendChild(timeCell);
            row.appendChild(eventCell);
            daySchedule.appendChild(row);
        }
    }

    applyDayMode(isDayModeEnabled);
    highlightCurrentTime();
}

// === МОДАЛЬНЕ ВІКНО ДЛЯ ПОДІЙ ===

// Відкриття модального вікна
function openEventModal(cell, isEdit = false) {
    modal.style.display = 'block';

    const { date, time } = cell.dataset;

    if (isEdit) {
        const existingEvent = events.plans[date]?.[time]?.[0] || '';
        eventDescriptionInput.value = existingEvent; // Заповнюємо поле опису існуючою подією
        eventTypeSelect.value = 'plans';
    } else {
        eventDescriptionInput.value = ''; // Очищуємо поле для нової події
        eventTypeSelect.value = 'plans';
    }

    saveEventButton.onclick = () => {
        const description = eventDescriptionInput.value.trim();
        const type = eventTypeSelect.value; // Тип події ("plans" або "holidays")

        if (description) {
            if (isEdit) {
                // Оновлюємо існуючу подію
                events.plans[date][time] = [description];
            } else {
                // Додаємо нову подію
                addEvent(date, time, description, type);
            }
        }
        closeEventModal();
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeEventModal();
        }
    });

    cancelEventButton.onclick = closeEventModal;
}

// Закриття модального вікна
function closeEventModal() {
    modal.style.display = 'none';
}

// Додавання події через клітинку
function addEventByClick(cell) {
    openEventModal(cell);
}

// === КОНТЕКСТНЕ МЕНЮ ===

function openContextMenu(event, cell) {
    event.preventDefault(); // Забороняємо стандартне контекстне меню
    selectedEventCell = cell; // Зберігаємо обрану клітинку

    contextMenu.style.display = 'block';
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;
}


function closeContextMenu() {
    contextMenu.style.display = 'none';
    selectedEventCell = null;
}


document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target)) {
        closeContextMenu();
    }
});


// === ДЕННИЙ РЕЖИМ ===

// Застосування денного режиму
function applyDayMode(enabled) {
    const rows = daySchedule.querySelectorAll('tr');
    rows.forEach(row => {
        const time = row.firstChild.textContent;
        const [hour] = time.split(':').map(Number);
        if (enabled) {
            row.style.display = (hour >= 8 && hour < 22) ? '' : 'none';
        } else {
            row.style.display = '';
        }
    });
}

const dayModeToggle = document.getElementById('dayModeToggle');
dayModeToggle.addEventListener('change', (e) => {
    isDayModeEnabled = e.target.checked;
    localStorage.setItem('dayMode', JSON.stringify(isDayModeEnabled)); // Зберігаємо стан у localStorage
    applyDayMode(isDayModeEnabled); // Застосовуємо денний режим
});

// Ініціалізація стану денного режиму
const savedDayMode = JSON.parse(localStorage.getItem('dayMode')) || false;
dayModeToggle.checked = savedDayMode; // Встановлюємо стан перемикача
applyDayMode(savedDayMode); // Застосовуємо стан денного режиму

// === ПРОКРУТКА ДО ПОТОЧНОГО ЧАСУ ===

// Прокрутка до поточного часу
function scrollToCurrentTime() {
    const now = new Date();
    const currentCell = document.querySelector(`td[data-date="${now.toISOString().slice(0, 10)}"][data-time="${String(now.getHours()).padStart(2, '0')}:${now.getMinutes() < 30 ? '00' : '30'}"]`);
    if (currentCell) {
        currentCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        currentCell.style.backgroundColor = 'yellow';
    }
}

// === ДОДАВАННЯ ПОДІЙ ===

// Додавання події
function addEvent(date, time, description, type = 'plans') {
    if (type === 'plans') {
        if (!events.plans[date]) events.plans[date] = {};
        if (!events.plans[date][time]) events.plans[date][time] = [];
        events.plans[date][time].push(description);
    } else if (type === 'holidays') {
        if (!events.holidays[date]) events.holidays[date] = [];
        events.holidays[date].push(description);
    }

    // Оновити місячний календар або розклад дня
    if (selectedDate === date) {
        createDaySchedule(date); // Оновити розклад дня, якщо активний
    }
    
    createMonthCalendar(); // Оновити місячний календар
}

// Редагування події
document.getElementById('editEvent').addEventListener('click', () => {
    if (selectedEventCell) {
        openEventModal(selectedEventCell, true); // Відкриваємо модальне вікно в режимі редагування
        closeContextMenu();
    }
});

// Видалення події
document.getElementById('deleteEvent').addEventListener('click', () => {
    if (selectedEventCell) {
        const { date, time } = selectedEventCell.dataset;
        delete events.plans[date][time]; // Видаляємо подію
        if (Object.keys(events.plans[date]).length === 0) delete events.plans[date]; // Видаляємо дату, якщо порожня
        createMonthCalendar(); // Оновлюємо місячний календар
        if (selectedDate === date) createDaySchedule(date); // Оновлюємо розклад дня
        closeContextMenu();
    }
});


// Виділення поточної події
function highlightCurrentTime() {
    const now = getDateInTimezone(new Date(), userTimezone);
    const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${now.getMinutes() < 30 ? '00' : '30'}`;
    const currentCell = document.querySelector(`td[data-date="${currentDate}"][data-time="${currentTime}"]`);

    if (currentCell) {
        currentCell.style.backgroundColor = 'yellow';
    }
}


function getDateInTimezone(date, timezone) {
    return new Date(
        new Date(date).toLocaleString('en-US', { timeZone: timezone })
    );
}

function loadTimezones() {
    const timezoneSelector = document.getElementById('timezoneSelector');
    const timezones = Intl.supportedValuesOf('timeZone'); // Отримуємо всі підтримувані часові пояси
    
    timezones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz;
        option.textContent = tz;
        if (tz === userTimezone) option.selected = true;
        timezoneSelector.appendChild(option);
    });

    timezoneSelector.addEventListener('change', (e) => {
        userTimezone = e.target.value;
        localStorage.setItem('userTimezone', userTimezone); // Зберігаємо вибір
        createMonthCalendar(); // Оновлюємо календар
    });
}



// === ІНІЦІАЛІЗАЦІЯ ===

prevMonthButton.addEventListener('click', prevMonth);
nextMonthButton.addEventListener('click', nextMonth);
loadTimezones();
createMonthCalendar();
scrollToCurrentTime();
