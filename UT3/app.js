// #region *** VARIABLES GLOBALES ***

// *** ELEMENTOS DEL HTML

// -> Encabezado.
const HTML_HEADER = document.getElementsByClassName("header")[0];
const HTML_BUTTON_ADD_TASK = document.getElementsByClassName("header__add-task-button")[0];

// -> Para el modo oscuro.
const HTML_SWITCH_MODE_BUTTON = document.getElementsByClassName("header__switch-mode-button")[0];
const HTML_EMOJI_MODE = document.getElementsByClassName("fa-solid fa-sun")[0];

// -> Main.
const HTML_MAIN = document.getElementsByClassName("main")[0];

// -> Contenedores para las tareas en cada columna.
const HTML_CONTAINER_BACKLOG = document.getElementsByClassName("task-column__container--backlog")[0];
const HTML_CONTAINER_TO_DO = document.getElementsByClassName("task-column__container--to-do")[0];
const HTML_CONTAINER_IN_PROGRESS = document.getElementsByClassName("task-column__container--in-progress")[0];
const HTML_CONTAINER_DONE = document.getElementsByClassName("task-column__container--done")[0];
const HTML_CONTAINER_BLOCKED = document.getElementsByClassName("task-column__container--blocked")[0];

// Botones para expandir columnas (sólo para Mobile y Tablet).
const HTML_EXPAND_COLUMN_BUTTONS = document.getElementsByClassName("task-column__expand-button");

// -> Modal.
const HTML_TASK_MODAL = document.getElementsByClassName("task-modal")[0];

//      -> Títulos.
const HTML_TASK_MODAL_ADD_TASK_TITLE = document.getElementsByClassName("task-modal__title--add-task")[0];
const HTML_TASK_MODAL_CHANGE_TASK_TITLE = document.getElementsByClassName("task-modal__title--change-task")[0];

//      -> Inputs del modal.
const HTML_TASK_MODAL_INPUT_TITLE = document.getElementById("title");
const HTML_TASK_MODAL_INPUT_DESCRIPTION = document.getElementById("description");
const HTML_TASK_MODAL_INPUT_ASSIGNED_TO = document.getElementById("assignedTo");
const HTML_TASK_MODAL_INPUT_PRIORITY = document.getElementById("priority");
const HTML_TASK_MODAL_INPUT_STATUS = document.getElementById("status");
const HTML_TASK_MODAL_INPUT_END_DATE = document.getElementById("endDate");

//      -> Botones del modal.

//          -> Para añadir tarea.
const HTML_ADD_TASK_MODAL_BUTTON_CANCEL_TASK = document.getElementsByClassName("task-form__button--cancel-add-task")[0];
const HTML_ADD_TASK_MODAL_BUTTON_ACCEPT_TASK = document.getElementsByClassName("task-form__button--accept-add-task")[0];

//          -> Para editar tarea.
const HTML_CHANGE_TASK_MODAL_BUTTON_DELETE_TASK = document.getElementsByClassName("task-form__button--delete-change-task")[0];
const HTML_CHANGE_TASK_MODAL_BUTTON_CANCEL_TASK = document.getElementsByClassName("task-form__button--cancel-change-task")[0];
const HTML_CHANGE_TASK_MODAL_BUTTON_ACCEPT_TASK = document.getElementsByClassName("task-form__button--accept-change-task")[0];
// #endregion

// #region *** CLASES ***

// *** Clase Task
class Task {
    static #ID = 0;

    #id;
    #title;
    #description;
    #assignedTo;
    #priority;
    #endDate;
    #status;

    #HTMLCard;
    #HTMLTitle;
    #HTMLDescription;
    #HTMLAssignedTo;
    #HTMLPriority;
    #HTMLEndDate;

    constructor(id, title, description, assignedTo, priority, endDate, status) {
        if (id === -1) {
            ++Task.#ID;
            id = Task.#ID;
        }

        this.#id = id;
        this.#title = title;
        this.#description = description;
        this.#assignedTo = assignedTo;
        this.#priority = priority;
        this.#endDate = endDate;
        this.#status = status;

        this.#HTMLCard = document.createElement("article");
        this.#HTMLCard.classList.add("task-card");

        this.#HTMLTitle = document.createElement("h4");
        this.#HTMLDescription = document.createElement("p");
        this.#HTMLAssignedTo = document.createElement("p");
        this.#HTMLPriority = document.createElement("p");
        this.#HTMLEndDate = document.createElement("p");

        this.#HTMLCard.appendChild(this.#HTMLTitle);
        this.#HTMLCard.appendChild(this.#HTMLDescription);
        this.#HTMLCard.appendChild(this.#HTMLAssignedTo);
        this.#HTMLCard.appendChild(this.#HTMLPriority);
        this.#HTMLCard.appendChild(this.#HTMLEndDate);

        this.#updateHTMLCard();

        const task = this;
        const card = this.#HTMLCard;

        card.addEventListener("click", function () {
            TaskManager.changeTaskToEdit(task);
            showChangeTaskModal();
        });

        card.addEventListener("dragstart", function (event) {
            TaskManager.changeTaskToEdit(task);
            event.dataTransfer.setData("text/plain", event.target.id);
            card.classList.add("dragging");
        });

        card.addEventListener("dragend", function () {
            card.classList.remove("dragging");
        });
    }

    static set ID(id) {
        if (typeof id === "number") {
            Task.#ID = id;
        }
    }

    static get ID() {
        return Task.#ID;
    }

    get id() {
        return this.#id;
    }

    get title() {
        return this.#title;
    }

    get description() {
        return this.#description;
    }

    get assignedTo() {
        return this.#assignedTo;
    }

    get priority() {
        return this.#priority;
    }

    get endDate() {
        return this.#endDate;
    }

    set status(newStatus) {
        if (["Backlog", "To Do", "In Progress", "Blocked", "Done"].includes(newStatus)) {
            this.#status = newStatus;
        }
    }

    get status() {
        return this.#status;
    }

    get HTMLCard() {
        return this.#HTMLCard;
    }

    updateTask(title, description, assignedTo, priority, endDate, status) {
        this.#title = title;
        this.#description = description;
        this.#assignedTo = assignedTo;
        this.#priority = priority;
        this.#endDate = endDate;
        this.#status = status;
        this.#updateHTMLCard();
    }

    #updateHTMLCard() {
        this.#HTMLCard.id = `task-card_${this.#id}`;
        this.#HTMLCard.draggable = true;

        this.#HTMLTitle.innerHTML = this.#title;
        this.#HTMLTitle.classList.add("task-card__title");

        this.#HTMLDescription.innerHTML = `
            <i class="fa-regular fa-pen-to-square"></i>
            ${this.#description}
        `;

        this.#HTMLAssignedTo.innerHTML = `
            <i class="fa-solid fa-user"></i>
            ${this.#assignedTo}
        `;

        this.#HTMLPriority.innerHTML = `
            <i class="fa-solid fa-star"></i>
            ${this.#priority}
        `;

        this.#HTMLEndDate.innerHTML = `
            <i class="fa-regular fa-calendar-days"></i>
            ${this.#endDate}
        `;
    }
}

// *** Clase TaskManager
class TaskManager {
    static #TASK_TO_EDIT;
    static #TASK_TO_EDIT_STATUS;

    // Listas que guardan las tareas.
    static #BACKLOG = [];
    static #TO_DO = [];
    static #IN_PROGRESS = [];
    static #BLOCKED = [];
    static #DONE = [];

    static get TASK_TO_EDIT() {
        return this.#TASK_TO_EDIT;
    }

    static get BACKLOG() {
        return this.#BACKLOG;
    }

    static get TO_DO() {
        return this.#TO_DO;
    }

    static get IN_PROGRESS() {
        return this.#IN_PROGRESS;
    }

    static get BLOCKED() {
        return this.#BLOCKED;
    }

    static get DONE() {
        return this.#DONE;
    }

    static changeTaskToEdit(task) {
        this.#TASK_TO_EDIT = task;
        this.#TASK_TO_EDIT_STATUS = task.status;
    }

    static addNewTask(id, title, description, assignedTo, priority, endDate, status) {
        const newTask = new Task(id, title, description, assignedTo, priority, endDate, status);
        const newTaskStatus = newTask.status;
        let container;
        let list;

        switch (newTaskStatus) {
            case "Backlog":
                container = HTML_CONTAINER_BACKLOG;
                list = this.#BACKLOG;
                break;
            case "To Do":
                container = HTML_CONTAINER_TO_DO;
                list = this.#TO_DO;
                break;
            case "In Progress":
                container = HTML_CONTAINER_IN_PROGRESS;
                list = this.#IN_PROGRESS;
                break;
            case "Blocked":
                container = HTML_CONTAINER_BLOCKED;
                list = this.#BLOCKED;
                break;
            case "Done":
                container = HTML_CONTAINER_DONE;
                list = this.#DONE;
                break;
        }
        list.push(newTask);
        container.appendChild(newTask.HTMLCard);
    }

    static deleteTaskToEdit() {
        const taskToDeleteId = this.#TASK_TO_EDIT.id;
        const taskToDeleteStatus = this.#TASK_TO_EDIT.status;
        let container;
        let list;

        switch (taskToDeleteStatus) {
            case "Backlog":
                container = HTML_CONTAINER_BACKLOG;
                list = this.#BACKLOG;
                break;
            case "To Do":
                container = HTML_CONTAINER_TO_DO;
                list = this.#TO_DO;
                break;
            case "In Progress":
                container = HTML_CONTAINER_IN_PROGRESS;
                list = this.#IN_PROGRESS;
                break;
            case "Blocked":
                container = HTML_CONTAINER_BLOCKED;
                list = this.#BLOCKED;
                break;
            case "Done":
                container = HTML_CONTAINER_DONE;
                list = this.#DONE;
                break;
        }
        container.removeChild(this.#TASK_TO_EDIT.HTMLCard);
        list.forEach((task, index) => {
            if (task.id === taskToDeleteId) {
                list.splice(index, 1);
                return;
            }
        });
        this.#TASK_TO_EDIT = null;
        this.#TASK_TO_EDIT_STATUS = null;
    }

    static editTaskToEdit(title, description, assignedTo, priority, endDate, status) {
        this.#TASK_TO_EDIT.updateTask(title, description, assignedTo, priority, endDate, status);
        this.moveTaskToEditToCorrectList();
        this.#moveTaskToEditToCorrectContainer();
    }

    static #moveTaskToEditToCorrectContainer() {
        const taskToMoveOldStatus = this.#TASK_TO_EDIT_STATUS;
        const taskToMoveActualStatus = this.#TASK_TO_EDIT.status;

        if (taskToMoveOldStatus !== taskToMoveActualStatus) {
            let oldContainer;
            switch (taskToMoveOldStatus) {
                case "Backlog":
                    oldContainer = HTML_CONTAINER_BACKLOG;
                    break;
                case "To Do":
                    oldContainer = HTML_CONTAINER_TO_DO;
                    break;
                case "In Progress":
                    oldContainer = HTML_CONTAINER_IN_PROGRESS;
                    break;
                case "Blocked":
                    oldContainer = HTML_CONTAINER_BLOCKED;
                    break;
                case "Done":
                    oldContainer = HTML_CONTAINER_DONE;
                    break;
            }

            let newContainer;
            switch (taskToMoveActualStatus) {
                case "Backlog":
                    newContainer = HTML_CONTAINER_BACKLOG;
                    break;
                case "To Do":
                    newContainer = HTML_CONTAINER_TO_DO;
                    break;
                case "In Progress":
                    newContainer = HTML_CONTAINER_IN_PROGRESS;
                    break;
                case "Blocked":
                    newContainer = HTML_CONTAINER_BLOCKED;
                    break;
                case "Done":
                    newContainer = HTML_CONTAINER_DONE;
                    break;
            }
            oldContainer.removeChild(this.#TASK_TO_EDIT.HTMLCard);
            newContainer.appendChild(this.#TASK_TO_EDIT.HTMLCard);
        }
    }

    static moveTaskToEditToCorrectList() {
        const taskToMoveId = this.#TASK_TO_EDIT.id;
        const taskToMoveOldStatus = this.#TASK_TO_EDIT_STATUS;
        const taskToMoveActualStatus = this.#TASK_TO_EDIT.status;

        if (taskToMoveOldStatus !== taskToMoveActualStatus) {
            let oldList;
            switch (taskToMoveOldStatus) {
                case "Backlog":
                    oldList = this.#BACKLOG;
                    break;
                case "To Do":
                    oldList = this.#TO_DO;
                    break;
                case "In Progress":
                    oldList = this.#IN_PROGRESS;
                    break;
                case "Blocked":
                    oldList = this.#BLOCKED;
                    break;
                case "Done":
                    oldList = this.#DONE;
                    break;
            }

            let newList;
            switch (taskToMoveActualStatus) {
                case "Backlog":
                    newList = this.#BACKLOG;
                    break;
                case "To Do":
                    newList = this.#TO_DO;
                    break;
                case "In Progress":
                    newList = this.#IN_PROGRESS;
                    break;
                case "Blocked":
                    newList = this.#BLOCKED;
                    break;
                case "Done":
                    newList = this.#DONE;
                    break;
            }

            oldList.forEach((task, index) => {
                if (task.id === taskToMoveId) {
                    oldList.splice(index, 1);
                    return;
                }
            });
            newList.push(this.#TASK_TO_EDIT);
        }
    }

    static searchTaskById(taskToSearchId) {
        return this.#BACKLOG.find(task => task.id === taskToSearchId) ||
            this.#TO_DO.find(task => task.id === taskToSearchId) ||
            this.#IN_PROGRESS.find(task => task.id === taskToSearchId) ||
            this.#BLOCKED.find(task => task.id === taskToSearchId) ||
            this.#DONE.find(task => task.id === taskToSearchId);
    }
}

// #endregion

// #region *** EVENTOS ***

// Muestra el modal en modo Agregar tarea.
function showAddTaskModal() {
    HTML_TASK_MODAL.classList.remove("down");
    HTML_TASK_MODAL.classList.add("over");

    HTML_TASK_MODAL_ADD_TASK_TITLE.classList.remove("hidden");
    HTML_TASK_MODAL_CHANGE_TASK_TITLE.classList.add("hidden");

    HTML_CHANGE_TASK_MODAL_BUTTON_DELETE_TASK.classList.add("hidden");
    HTML_CHANGE_TASK_MODAL_BUTTON_CANCEL_TASK.classList.add("hidden");
    HTML_CHANGE_TASK_MODAL_BUTTON_ACCEPT_TASK.classList.add("hidden");
    HTML_ADD_TASK_MODAL_BUTTON_CANCEL_TASK.classList.remove("hidden");
    HTML_ADD_TASK_MODAL_BUTTON_ACCEPT_TASK.classList.remove("hidden");
}

// Muestra el modal en modo Editar tarea.
function showChangeTaskModal() {
    HTML_TASK_MODAL.classList.remove("down");
    HTML_TASK_MODAL.classList.add("over");

    HTML_TASK_MODAL_ADD_TASK_TITLE.classList.add("hidden");
    HTML_TASK_MODAL_CHANGE_TASK_TITLE.classList.remove("hidden");

    HTML_CHANGE_TASK_MODAL_BUTTON_DELETE_TASK.classList.remove("hidden");
    HTML_CHANGE_TASK_MODAL_BUTTON_CANCEL_TASK.classList.remove("hidden");
    HTML_CHANGE_TASK_MODAL_BUTTON_ACCEPT_TASK.classList.remove("hidden");
    HTML_ADD_TASK_MODAL_BUTTON_CANCEL_TASK.classList.add("hidden");
    HTML_ADD_TASK_MODAL_BUTTON_ACCEPT_TASK.classList.add("hidden");

    HTML_TASK_MODAL_INPUT_TITLE.value = TaskManager.TASK_TO_EDIT.title;
    HTML_TASK_MODAL_INPUT_DESCRIPTION.value = TaskManager.TASK_TO_EDIT.description;
    HTML_TASK_MODAL_INPUT_ASSIGNED_TO.value = TaskManager.TASK_TO_EDIT.assignedTo;
    HTML_TASK_MODAL_INPUT_PRIORITY.value = TaskManager.TASK_TO_EDIT.priority;
    HTML_TASK_MODAL_INPUT_STATUS.value = TaskManager.TASK_TO_EDIT.status;
    HTML_TASK_MODAL_INPUT_END_DATE.value = TaskManager.TASK_TO_EDIT.endDate;
}

function showPrincipalPage() {
    HTML_TASK_MODAL.classList.remove("over");
    HTML_TASK_MODAL.classList.add("down");
}

function cleanInputs() {
    const modalFields = document.querySelectorAll("input");
    modalFields.forEach(field => {
        field.value = "";
    });
}

// Cambia entre dark mode y light mode.
function changeMode() {
    document.body.classList.toggle("dark-mode");

    if (HTML_EMOJI_MODE.classList.contains("fa-sun")) {
        HTML_EMOJI_MODE.classList.remove("fa-sun");
        HTML_EMOJI_MODE.classList.add("fa-moon");
    } else {
        HTML_EMOJI_MODE.classList.remove("fa-moon");
        HTML_EMOJI_MODE.classList.add("fa-sun");
    }
}

// Mueve la tarjeta de una tarea dentro de un contenedor mediante drag - parte frontend.
function dragTaskCardOver(e, container) {
    e.preventDefault();

    const draggingCard = document.querySelector(".dragging");

    const afterElement = getDragAfterElement(container, e.clientY);
    if (afterElement == null) {
        container.appendChild(draggingCard);
    } else {
        container.insertBefore(draggingCard, afterElement);
    }
}

function dropTaskCard(e, container) {
    e.preventDefault();

    const draggingCard = document.querySelector(".dragging");
    const taskCardId = parseInt(draggingCard.id.split("_")[1]);
    const task = TaskManager.searchTaskById(taskCardId); // Busca la tarea correspondiente por ID
    const containerName = container.classList[1].split("--")[1]; // Obtiene el nombre del contenedor destino

    let newStatus;
    switch (containerName) {
        case "backlog":
            newStatus = "Backlog";
            break;
        case "to-do":
            newStatus = "To Do";
            break;
        case "in-progress":
            newStatus = "In Progress";
            break;
        case "blocked":
            newStatus = "Blocked";
            break;
        case "done":
            newStatus = "Done";
            break;
    }

    // Actualiza el estado de la tarea localmente
    task.status = newStatus;
    TaskManager.moveTaskToEditToCorrectList();

    // Actualizar en el backend
    const updatedTask = {
        status: newStatus
    };

    fetch(`http://localhost:3000/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask) 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al actualizar el estado de la tarea');
        }
        return response.json();
    })
    .then(data => {
        console.log(`Tarea ${task.id} actualizada al estado ${newStatus} en el backend.`);
    })
    .catch(error => console.error('Error al actualizar el estado de la tarea:', error));
}


// Obtiene el elemento después del cual se soltará la tarjeta.
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".task-card:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// *** PÁGINA PRINCIPAL

// -> Botón AGREGAR TAREA en la página principal.
HTML_BUTTON_ADD_TASK.addEventListener("click", function () {
    showAddTaskModal();
});

// -> Modo oscuro.
HTML_SWITCH_MODE_BUTTON.addEventListener("click", function () {
    changeMode();
});

// -> Botones para expandir columnas (sólo para Mobile y Tablet).
Array.from(HTML_EXPAND_COLUMN_BUTTONS).forEach(button => button.addEventListener("click", function () {
    const siblingContainerTasks = button.previousElementSibling;
    siblingContainerTasks.classList.toggle("occupyAllHeight");
}));

// -> Drag and drop para los contenedores de tarjetas de tarea.
HTML_CONTAINER_BACKLOG.addEventListener("dragover", function (event) {
    dragTaskCardOver(event, HTML_CONTAINER_BACKLOG);
});
HTML_CONTAINER_BACKLOG.addEventListener("drop", function (event) {
    dropTaskCard(event, HTML_CONTAINER_BACKLOG); //
});

HTML_CONTAINER_TO_DO.addEventListener("dragover", function (event) {
    dragTaskCardOver(event, HTML_CONTAINER_TO_DO);
});
HTML_CONTAINER_TO_DO.addEventListener("drop", function (event) {
    dropTaskCard(event, HTML_CONTAINER_TO_DO); // 
});

HTML_CONTAINER_IN_PROGRESS.addEventListener("dragover", function (event) {
    dragTaskCardOver(event, HTML_CONTAINER_IN_PROGRESS);
});
HTML_CONTAINER_IN_PROGRESS.addEventListener("drop", function (event) {
    dropTaskCard(event, HTML_CONTAINER_IN_PROGRESS); // 
});

HTML_CONTAINER_BLOCKED.addEventListener("dragover", function (event) {
    dragTaskCardOver(event, HTML_CONTAINER_BLOCKED);
});
HTML_CONTAINER_BLOCKED.addEventListener("drop", function (event) {
    dropTaskCard(event, HTML_CONTAINER_BLOCKED); // 
});

HTML_CONTAINER_DONE.addEventListener("dragover", function (event) {
    dragTaskCardOver(event, HTML_CONTAINER_DONE);
});
HTML_CONTAINER_DONE.addEventListener("drop", function (event) {
    dropTaskCard(event, HTML_CONTAINER_DONE); // 
});


// *** MODAL AGREGAR TAREA

// -> Botón ACEPTAR en modo Agregar tarea.
HTML_ADD_TASK_MODAL_BUTTON_ACCEPT_TASK.addEventListener("click", function (event) {
    event.preventDefault();

    const newTask = {
        title: HTML_TASK_MODAL_INPUT_TITLE.value,
        description: HTML_TASK_MODAL_INPUT_DESCRIPTION.value,
        assignedTo: HTML_TASK_MODAL_INPUT_ASSIGNED_TO.value,
        priority: HTML_TASK_MODAL_INPUT_PRIORITY.value,
        startDate: new Date().toLocaleDateString(),
        endDate: HTML_TASK_MODAL_INPUT_END_DATE.value,
        status: HTML_TASK_MODAL_INPUT_STATUS.value,
        comments: []
    };

    fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask)
    })
    .then(response => response.json())
    .then(task => {
        TaskManager.addNewTask(
            task.id,
            task.title,
            task.description,
            task.assignedTo,
            task.priority,
            task.endDate,
            task.status
        );
        showPrincipalPage();
        cleanInputs();
    })
    .catch(error => console.error('Error al agregar la tarea:', error));
});

// -> Botón CANCELAR en modo Agregar tarea.
HTML_ADD_TASK_MODAL_BUTTON_CANCEL_TASK.addEventListener("click", function (event) {
    event.preventDefault();

    showPrincipalPage();
    cleanInputs();
});

// *** MODAL EDITAR TAREA

// -> Botón ACEPTAR en modo Editar tarea.
HTML_CHANGE_TASK_MODAL_BUTTON_ACCEPT_TASK.addEventListener("click", function (event) {
    event.preventDefault();

    const updatedTask = {
        title: HTML_TASK_MODAL_INPUT_TITLE.value,
        description: HTML_TASK_MODAL_INPUT_DESCRIPTION.value,
        assignedTo: HTML_TASK_MODAL_INPUT_ASSIGNED_TO.value,
        priority: HTML_TASK_MODAL_INPUT_PRIORITY.value,
        endDate: HTML_TASK_MODAL_INPUT_END_DATE.value,
        status: HTML_TASK_MODAL_INPUT_STATUS.value
    };

    fetch(`http://localhost:3000/api/tasks/${TaskManager.TASK_TO_EDIT.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask)
    })
    .then(response => response.json())
    .then(task => {
        TaskManager.editTaskToEdit(
            task.title,
            task.description,
            task.assignedTo,
            task.priority,
            task.endDate,
            task.status
        );
        showPrincipalPage();
        cleanInputs();
    })
    .catch(error => console.error('Error al editar la tarea:', error));
});

// -> Botón CANCELAR en modo Editar tarea.
HTML_CHANGE_TASK_MODAL_BUTTON_CANCEL_TASK.addEventListener("click", function (event) {
    event.preventDefault();

    showPrincipalPage();
    cleanInputs();
});

// -> Botón ELIMINAR en modo Editar tarea.
HTML_CHANGE_TASK_MODAL_BUTTON_DELETE_TASK.addEventListener("click", function (event) {
    event.preventDefault();

    fetch(`http://localhost:3000/api/tasks/${TaskManager.TASK_TO_EDIT.id}`, {
        method: 'DELETE'
    })
    .then(() => {
        TaskManager.deleteTaskToEdit();
        showPrincipalPage();
        cleanInputs();
    })
    .catch(error => console.error('Error al eliminar la tarea:', error));
});

// #endregion

window.addEventListener("DOMContentLoaded", function () {
    fetch('http://localhost:3000/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
                TaskManager.addNewTask(
                    task.id,
                    task.title,
                    task.description,
                    task.assignedTo,
                    task.priority,
                    task.endDate,
                    task.status
                );
            });
        })
        .catch(error => console.error('Error al cargar las tareas:', error));
});

