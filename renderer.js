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
const eventTitleInput = document.getElementById('eventTitle'); // Поле для введення назви події
let draggedEvent = null;


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
    cell.addEventListener('click', () => showWeekView(isoDate));
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

// Показ розкладу для тижня
function showWeekView(date) {
    selectedDate = date;

    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Кінець тижня через 6 днів після обраної дати

    monthView.style.display = 'none';
    dayView.style.display = 'block';

    document.getElementById('selectedDate').textContent = `Тиждень: ${startDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })} - ${endDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}`;
    createWeekSchedule(startDate);
}


function createWeekSchedule(startDate) {
    daySchedule.innerHTML = '';

    // Оновлення заголовка таблиці
    const thead = document.querySelector('#daySchedule thead tr');
    thead.innerHTML = '<th class="time-label">Час</th>'; // Очищуємо і додаємо колонку для часу

    const weekDates = [];
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayOffset);

        weekDates.push(currentDate);

        const th = document.createElement('th');
        th.textContent = currentDate.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'short' });
        th.dataset.date = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

        if (currentDate.toDateString() === new Date().toDateString()) {
            th.classList.add('today');
        }

        thead.appendChild(th);
    }

    // Створення рядків для часу
    for (let hour = 0; hour < 24; hour++) {
        for (let minutes = 0; minutes < 60; minutes += 30) {
            const row = document.createElement('tr');

            const timeCell = document.createElement('td');
            timeCell.textContent = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            timeCell.classList.add('time-label');
            row.appendChild(timeCell);

            weekDates.forEach(currentDate => {
                const eventCell = document.createElement('td');
                const isoDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                eventCell.dataset.date = isoDate;
                eventCell.dataset.time = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                eventCell.setAttribute('draggable', 'true'); // Дозволяємо перетягування
                eventCell.addEventListener('dragstart', (e) => handleDragStart(e, eventCell));
                eventCell.addEventListener('dragover', handleDragOver);
                eventCell.addEventListener('drop', (e) => handleDrop(e, eventCell));
                eventCell.addEventListener('dblclick', () => addEventByClick(eventCell));

                // Відображення подій
                if (events.plans[isoDate] && events.plans[isoDate][eventCell.dataset.time]) {
                    events.plans[isoDate][eventCell.dataset.time].forEach(event => {
                        const span = document.createElement('span');
                        span.textContent = event.title;
                        span.style.fontWeight = 'bold';

                        eventCell.appendChild(span);
                    });
                }

                row.appendChild(eventCell);
            });

            daySchedule.appendChild(row);
        }
    }

    applyDayMode(isDayModeEnabled);
    highlightCurrentTime();
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

// Відкриття модального вікна для додавання/редагування події
function openEventModal(cell, existingEvent = null) {
    modal.style.display = 'block';

    const { date, time } = cell.dataset;

    if (existingEvent) {
        // Якщо подія вже існує, заповнюємо поля модального вікна
        eventTitleInput.value = existingEvent.title || '';
        eventDescriptionInput.value = existingEvent.description || '';
    } else {
        // Для нової події очищуємо поля
        eventTitleInput.value = '';
        eventDescriptionInput.value = '';
    }

    saveEventButton.onclick = () => {
        const title = eventTitleInput.value.trim();
        const description = eventDescriptionInput.value.trim();

        if (title) {
            if (!events.plans[date]) events.plans[date] = {};
            if (!events.plans[date][time]) events.plans[date][time] = [];
            
            // Якщо подія вже існує, замінюємо її, інакше додаємо нову
            if (existingEvent) {
                existingEvent.title = title;
                existingEvent.description = description;
            } else {
                events.plans[date][time].push({ title, description });
            }

            // Оновлюємо розклад після збереження
            const startDate = new Date(selectedDate);
            startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Початок тижня
            createWeekSchedule(startDate);

            closeEventModal();
        }
    };

    cancelEventButton.onclick = closeEventModal;
}


// Закриття модального вікна
function closeEventModal() {
    modal.style.display = 'none';
}

// Додавання події через клітинку
function addEventByClick(cell) {
    const { date, time } = cell.dataset;

    if (events.plans[date] && events.plans[date][time]) {
        // Якщо є подія, відкриваємо модальне вікно для редагування першої події
        const existingEvent = events.plans[date][time][0]; // Припускаємо одну подію в клітинці
        openEventModal(cell, existingEvent);
    } else {
        // Якщо події немає, відкриваємо модальне вікно для додавання
        openEventModal(cell);
    }
}

// === КОНТЕКСТНЕ МЕНЮ ===

function openContextMenu(event, cell) {
    event.preventDefault(); // Забороняємо стандартне контекстне меню
    selectedEventCell = cell; // Зберігаємо обрану клітинку

    const { date, time } = cell.dataset;

    // Перевіряємо, чи є події в цій клітинці
    const hasEvent = events.plans[date] && events.plans[date][time] && events.plans[date][time].length > 0;

    // Відображаємо відповідні кнопки в контекстному меню
    document.getElementById('editEvent').style.display = hasEvent ? 'block' : 'none';
    document.getElementById('deleteEvent').style.display = hasEvent ? 'block' : 'none';

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

    // Оновлення розкладу для тижня
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Початок тижня (понеділок)
    createWeekSchedule(startDate);
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

        if (events.plans[date] && events.plans[date][time]) {
            delete events.plans[date][time]; // Видаляємо подію
            if (Object.keys(events.plans[date]).length === 0) delete events.plans[date]; // Видаляємо дату, якщо порожня
        }

        // Оновлюємо розклад
        const startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Початок тижня
        createWeekSchedule(startDate);

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

function handleDragStart(e, cell) {
    const { date, time } = cell.dataset;

    if (events.plans[date] && events.plans[date][time]) {
        draggedEvent = {
            date,
            time,
            event: events.plans[date][time][0], // Припускаємо одну подію
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(draggedEvent));
    }
}

// Дозволяємо перетягування
function handleDragOver(e) {
    e.preventDefault();
}

// Кінцевий пункт перетягування
function handleDrop(e, cell) {
    e.preventDefault();
    const { date, time } = cell.dataset;

    if (draggedEvent) {
        if (events.plans[date] && events.plans[date][time]) {
            // Якщо клітинка зайнята, відкриваємо модальне вікно з варіантами
            openConflictModal(cell, draggedEvent);
        } else {
            // Якщо клітинка пуста, переносимо подію
            transferEvent(draggedEvent, date, time);
        }
        draggedEvent = null; // Скидаємо дані про перетягування
    }
}


function openConflictModal(targetCell, draggedEvent) {
    const conflictModal = document.getElementById('conflictModal'); // Модальне вікно конфліктів
    conflictModal.style.display = 'block';

    // Отримуємо дані про цільову комірку
    const { date: targetDate, time: targetTime } = targetCell.dataset;

    // Перевіряємо подію в цільовій комірці
    const existingEvent = events.plans[targetDate] && events.plans[targetDate][targetTime] 
        ? { 
            date: targetDate, 
            time: targetTime, 
            event: events.plans[targetDate][targetTime][0] // Передбачається одна подія
          } 
        : null;

    // Обробка кнопок у модальному вікні
    document.getElementById('replaceEvent').onclick = () => {
        // Заміна події
        if (existingEvent) {
            delete events.plans[existingEvent.date][existingEvent.time]; // Видаляємо стару подію
        }
        transferEvent(draggedEvent, targetDate, targetTime); // Переносимо нову подію
        closeConflictModal();
    };

    document.getElementById('cancelMove').onclick = () => {
        // Скасування переносу
        closeConflictModal();
    };

    document.getElementById('swapEvents').onclick = () => {
        if (existingEvent) {
            // Поміняти події місцями
            transferEvent(existingEvent, draggedEvent.date, draggedEvent.time); // Стару подію переміщаємо у стару комірку
            transferEvent(draggedEvent, targetDate, targetTime); // Перетягнуту подію переміщаємо у нову комірку
        }
        closeConflictModal();
    };
}


function transferEvent(event, newDate, newTime) {
    // Перевіряємо, чи подія існує
    if (!event || !event.event) {
        console.error("Подія не знайдена для переносу:", event);
        return;
    }

    // Видаляємо подію зі старого місця
    if (events.plans[event.date] && events.plans[event.date][event.time]) {
        delete events.plans[event.date][event.time];
        if (Object.keys(events.plans[event.date]).length === 0) {
            delete events.plans[event.date]; // Видаляємо порожню дату
        }
    }

    // Додаємо подію на нове місце
    if (!events.plans[newDate]) events.plans[newDate] = {};
    if (!events.plans[newDate][newTime]) events.plans[newDate][newTime] = [];
    events.plans[newDate][newTime].push(event.event);

    // Оновлюємо розклад
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Початок тижня
    createWeekSchedule(startDate);
}


function closeConflictModal() {
    const conflictModal = document.getElementById('conflictModal');
    conflictModal.style.display = 'none';
}

function transferEvent(event, newDate, newTime) {
    // Видаляємо подію зі старого місця
    delete events.plans[event.date][event.time];
    if (Object.keys(events.plans[event.date]).length === 0) {
        delete events.plans[event.date];
    }

    // Додаємо подію на нове місце
    if (!events.plans[newDate]) events.plans[newDate] = {};
    if (!events.plans[newDate][newTime]) events.plans[newDate][newTime] = [];
    events.plans[newDate][newTime].push(event.event);

    // Оновлюємо розклад
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Початок тижня
    createWeekSchedule(startDate);
}



// === ІНІЦІАЛІЗАЦІЯ ===

prevMonthButton.addEventListener('click', prevMonth);
nextMonthButton.addEventListener('click', nextMonth);
loadTimezones();
createMonthCalendar();
scrollToCurrentTime();

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeEventModal();
    }
});

document.addEventListener('click', (e) => {
    if (modal.style.display === 'block' && !modal.contains(e.target)) {
        closeEventModal();
    }
});