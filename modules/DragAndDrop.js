export class DragAndDrop {
    constructor(calendar, eventManager) {
        this.calendar = calendar;
        this.eventManager = eventManager;
        this.draggedEvent = null;

        this.initialize();
    }

    initialize() {
        // Додаємо обробники на клітинки календаря
        this.calendar.container.addEventListener('dragstart', (e) => this.handleDragStart(e));
        this.calendar.container.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.calendar.container.addEventListener('drop', (e) => this.handleDrop(e));
    }

    handleDragStart(e) {
        const cell = e.target.closest('.cell');
        if (cell && cell.classList.contains('event-main')) {
            const date = cell.dataset.date;
            const event = this.eventManager.getEvents()[date][0];

            this.draggedEvent = { date, event };
            e.dataTransfer.setData('text/plain', JSON.stringify(this.draggedEvent));
        }
    }

    handleDragOver(e) {
        e.preventDefault(); // Дозволяємо скидання
    }

    handleDrop(e) {
        e.preventDefault();
        const cell = e.target.closest('.cell');

        if (cell && this.draggedEvent) {
            const targetDate = cell.dataset.date;

            // Видаляємо стару подію
            this.eventManager.removeEvent(this.draggedEvent.date, this.draggedEvent.event);

            // Додаємо подію на нове місце
            this.eventManager.addEvent(
                targetDate,
                this.draggedEvent.event.title,
                this.draggedEvent.event.duration
            );

            // Оновлюємо відображення
            this.eventManager.renderEvents();

            // Скидаємо поточну перетягувану подію
            this.draggedEvent = null;
        }
    }
}
