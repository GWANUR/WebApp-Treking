const EMOJIS = [
    "😀", "😂", "😍", "😎", "😭", "😡", "😴", "🤔", "🙌", "👍",
    "👎", "👏", "💪", "🙏", "🤷", "💖", "🎉", "🔥", "🌟", "💯",
    "✅", "❌", "💤", "😱", "😜", "😇", "🤩", "🥳", "😤", "🤯"
];

let emojiPicker = null; // делаем глобальной переменной

function removeEmojiPicker() {
    if (emojiPicker) {
        emojiPicker.remove();
        emojiPicker = null;
        document.removeEventListener('click', outsideClickListener);
    }
}

let outsideClickListener = null;

function showEmojiPicker(button, itemClass) {
    if (document.querySelector('.emoji-picker')) {
        removeEmojiPicker();
        return;
    }
    removeEmojiPicker(); // удаляем старую клавиатуру, если есть

    const input = document.querySelector(`${itemClass} .emoji-input-field`);

    emojiPicker = document.createElement('div');
    emojiPicker.classList.add('emoji-picker');

    EMOJIS.forEach(emoji => {
        const span = document.createElement('div');
        span.classList.add('emoji');
        span.textContent = emoji;
        span.onclick = () => {
            input.value += emoji;
            removeEmojiPicker();
            input.focus();
        };
        emojiPicker.appendChild(span);
    });

    document.querySelector(`${itemClass} .emoji-input`).appendChild(emojiPicker);


    // закрытие при клике вне клавиатуры
    outsideClickListener = (event) => {
        if (!emojiPicker.contains(event.target) && event.target !== button) {
            removeEmojiPicker();
        }
    };
    setTimeout(() => {
        document.addEventListener('click', outsideClickListener);
    }, 0);
}

function deleteTask(taskIndex, folderIndex) {
    const taskElement = document.querySelector(
        `.task_item[data-task-index="${taskIndex}"]`
    );
    if (taskElement) {
        taskElement.remove();
    }

    fetch(`traking_helper.php?method=deleteTask&folderIndex=${folderIndex}&taskIndex=${taskIndex}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadTasks(folderIndex);
            } else {
                console.error('Failed to delete task');
            }
        });
}
function addTask(folderIndex) {
    const container = document.querySelector(`#tasks_container .tasks_items`);
    const newTask = document.createElement('div');
    const empyt = document.querySelector('.tasks_empty');
    if (empyt) {
        empyt.remove();
    }
    newTask.classList.add('task_item');
    newTask.classList.add('task_new_item');
    newTask.innerHTML = `
            <div class="emoji-input">
                <input class="emoji-input-field" type="text" placeholder="Add an emoji...">
                <button onclick="showEmojiPicker(this, '.task_new_item');" class="emoji-button"><i class="bi bi-emoji-smile"></i></button>
            </div>
            <div class="task_active">
                <button onclick="saveTask(${(folderIndex)})">Save</button>
                <button onclick="addTaskUndo()">Undo</button>
            </div>
    `;
    container.appendChild(newTask);
}
function addTaskUndo() {
    const container = document.querySelector('.tasks_items');
    const newTaskElement = document.querySelector('.task_new_item');
    if (newTaskElement) {
        newTaskElement.remove();
    }
    const allTasks = document.querySelectorAll('.task_item');
    if (allTasks.length === 0) {
        container.innerHTML = `
            <div class="tasks_empty">
                <span><i class="bi bi-inbox"></i> Задач пока нет</span>
            </div>
        `;
    }
}
function saveTask(folderKey) { // folderKey = "0"
    const newTaskElement = document.querySelector('.task_new_item');
    const input = newTaskElement.querySelector('.emoji-input-field');
    const taskText = input.value.trim();
    if (!taskText) return;

    fetch(`traking_helper.php?method=addTask&folderIndex=${folderKey}&taskText=${encodeURIComponent(taskText)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.reload(); // можно заменить на динамическое добавление в DOM
            } else {
                alert(data.message || 'Ошибка добавления задачи');
            }
        })
        .catch(err => console.error(err));
}
function toggleTask(taskIndex, folderIndex) {
    const taskElement = document.querySelector(
        `.task_item[data-task-index="${taskIndex}"]`
    );
    const isReady = taskElement.getAttribute('data-task-ready') === 'true';
    const newStatus = !isReady;
    taskElement.setAttribute('data-task-ready', newStatus.toString());
    const icon = taskElement.querySelector('.task_toggle i');
    if (icon) {
        icon.className = newStatus ? 'bi bi-check-circle-fill' : 'bi bi-circle';
    }
    fetch(`traking_helper.php?method=toggleTask&folderIndex=${folderIndex}&taskIndex=${taskIndex}&isReady=${newStatus}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                calculatingGraph();
            } else {
                console.error('Failed to toggle task status');
            }
        });
}

function loadTasks(folderId) {
    fetch(`/src/data/treking.JSON`)
        .then(response => response.json())
        .then(data => {

            const folderIndex = folderId;

            if (data.FOLDER && data.FOLDER[folderIndex]) {

                const tasks = data.FOLDER[folderIndex].tasks || [];

                const container = document.querySelector('#tasks_container .tasks_items');
                if (!container) {
                    console.error('Container #tasks_container .tasks_items not found');
                    return;
                }

                container.innerHTML = '';

                // ✅ если задач нет
                if (tasks.length === 0) {
                    container.innerHTML = `
                        <div class="task_item tasks_empty">
                            <span><i class="bi bi-inbox"></i> Задач пока нет</span>
                        </div>
                    `;
                    return;
                }
                
                tasks.forEach((task, index) => {
                    addTaskElement(index, task.Name, task.status, folderId);
                });
                calculatingGraph();

            } else {

                console.error('Folder not found');

            }

        })
        .catch(err => console.error('JSON error:', err));
}

function addTaskElement(taskId, taskText, isReady, folderId) {

    const taskContainer = document.querySelector('#tasks_container .tasks_items');

    const taskElement = document.createElement('div');
    taskElement.classList.add('task_item');

    taskElement.setAttribute('data-task-index', taskId);
    taskElement.setAttribute('data-task-ready', isReady);

    taskElement.innerHTML = `
            <span class="task_name">${taskText}</span>
            <div class="active_task">
                <button onClick="renameTask(${taskId}, ${folderId})" class="task_rename" data-task-index="${taskId}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button onclick="deleteTask(${taskId}, ${folderId})" class="task_delete" data-task-index="${taskId}">
                    <i class="bi bi-trash"></i>
                </button>
                <button onclick="reminder(${taskId}, ${folderId})">
                    <i class="bi bi-bell-fill"></i>
                </button>
            </div>
            <button onclick="toggleTask(${taskId}, ${folderId})" class="task_toggle" data-task-index="${taskId}">
                ${isReady ? '<i class="bi bi-check-circle-fill"></i>' : '<i class="bi bi-circle"></i>'}
            </button>
    `;
    taskContainer.appendChild(taskElement);
}
function renameTask(taskId, folderId){

    const taskEl = document.querySelector(`.task_item[data-task-index="${taskId}"]`);
    const taskOldName = taskEl.querySelector('.task_name').textContent;

    taskEl.classList.add('task_rename_item');
    taskEl.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'emoji-input';

    const input = document.createElement('input');
    input.className = 'emoji-input-field';
    input.type = 'text';
    input.placeholder = 'Add an emoji...';
    input.value = taskOldName; // безопасно

    const emojiBtn = document.createElement('button');
    emojiBtn.className = 'emoji-button';
    emojiBtn.innerHTML = '<i class="bi bi-emoji-smile"></i>';
    emojiBtn.onclick = function(){ showEmojiPicker(this, `.task_item[data-task-index="${taskId}"]`); };

    wrapper.appendChild(input);
    wrapper.appendChild(emojiBtn);

    const actions = document.createElement('div');
    actions.className = 'task_active';

    actions.innerHTML = `
        <button onclick="saveRenameTask(${taskId},${folderId})">Save</button>
        <button onclick="renameTaskUndo(${taskId},${folderId})">Undo</button>
    `;

    taskEl.appendChild(wrapper);
    taskEl.appendChild(actions);
}
function renameTaskUndo(taskId,folderId){
    fetch(`/src/data/treking.JSON`)
    .then(response => response.json())
    .then(data => {
        const taskEl = document.querySelector(`.task_rename_item.task_item[data-task-index="${taskId}"]`);
        taskEl.classList.remove('task_rename_item');
        const taskOldName = data.FOLDER[folderId].tasks[taskId].Name;
        taskEl.innerHTML = `
            <span class="task_name">${taskOldName}</span>
            <div class="active_task">
                <button onclick="renameTask(${taskId}, ${folderId})" class="task_rename" data-task-index="${taskId}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button onclick="deleteTask(${taskId}, ${folderId})" class="task_delete" data-task-index="${taskId}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <button onclick="toggleTask(${taskId}, ${folderId})" class="task_toggle" data-task-index="${taskId}">
                <i class="bi bi-circle"></i>
            </button>
        `;
    })
}
function saveRenameTask(taskId, folderId){
    const taskName = document.querySelector(`.task_item[data-task-index="${taskId}"] .emoji-input-field`).value;
    fetch(`traking_helper.php?method=renameTask&folderIndex=${folderId}&taskIndex=${taskId}&taskText=${encodeURIComponent(taskName)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadTasks(folderId);
            } else {
                alert(data.message || 'Ошибка добавления задачи');
            }
        })
        .catch(err => console.error(err));
}


let currentPercent = 0;
function calculatingGraph(){

    let readyTask = 0;
    let allTask = 0;

    const container = document.querySelector('.tasks_items');
    const allTasks = container.querySelectorAll('.task_item');
    const containerStat = document.querySelector('.around_graph_container .stat');
    

    allTasks.forEach(taskEl => {
        allTask++
        if (taskEl.getAttribute('data-task-ready') === 'true' ? true : false) { 
            readyTask++;
        }
    });
    containerStat.querySelector('#total_tasks').innerHTML= `${allTask}`
    containerStat.querySelector('.ready_stat_value').innerHTML= `${readyTask}`

    const percent = Math.round((readyTask / allTask) * 100);
    animateGraph(percent);

    function animateGraph(targetPercent) {

        const graph = document.querySelector("#graph");
        const percentText = document.querySelector("#graph-status .procent");

        function step() {

            if (currentPercent === targetPercent) return;

            if (currentPercent < targetPercent) {
                currentPercent++;
            } else {
                currentPercent--;
            }

            graph.style.background =
                `conic-gradient(#73b928 0% ${currentPercent}%, #85241d ${currentPercent}% 100%)`;

            percentText.innerHTML = currentPercent;

            requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
}
let idTimer = 0
function timeReport() {
    idTimer++
    const tReportD = document.createElement('div')
    tReportD.id = `time_report_${idTimer}`;
    tReportD.classList.add('time_report');
    tReportD.innerHTML = `
        <div class="time_report_header">
            <span class='title'>Time report</span>
            <button onclick="closeTimeReport(${idTimer})"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="time_report_container">
            <div class="time">
                <span class="h">00</span>
                <span class="m">00</span>
                <span class="s">00</span>
            </div>
            <div class="actions">
                <button onclick="startTimeR(${idTimer})" class="start">Start</button>
            </div>
        </div>
    `;
    document.body.appendChild(tReportD);
    makeDraggable('time_report');
}
let timerInterval = null;

const timers = {};

function startTimeR(id) {

    const container = document.querySelector(`#time_report_${id}`);
    const containerB = container.querySelector(`.actions`);

    if (!container) {
        console.error("Timer container not found");
        return;
    }
    containerB.innerHTML = ``;

    var pause = document.createElement('button');
    pause.classList.add('pause');
    pause.innerHTML = 'Pause';
    pause.onclick = function () {pauseTimeR(id)}
    containerB.appendChild(pause);

    const h = container.querySelector('.h');
    const m = container.querySelector('.m');
    const s = container.querySelector('.s');

    h.textContent = String(0).padStart(2, '0');
    m.textContent = String(0).padStart(2, '0');
    s.textContent = String(0).padStart(2, '0');

    timers[id] = {
        start: Date.now(),
        elapsed: 0,
        interval: null
    };

    timers[id].interval = setInterval(() => {

        const diff = Date.now() - timers[id].start + timers[id].elapsed;

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        h.textContent = String(hours).padStart(2, '0');
        m.textContent = String(minutes).padStart(2, '0');
        s.textContent = String(seconds).padStart(2, '0');

    }, 1000);
}

function pauseTimeR(id) {

    if (!timers[id]) return;
    
    const container = document.querySelector(`#time_report_${id}`);
    const containerB = container.querySelector(`.actions`);

    if (!containerB) return

    containerB.innerHTML = ``;

    var resume = document.createElement('button');
    resume.classList.add('resume');
    resume.innerHTML = 'Resume';
    resume.onclick = function () {resumeTimeR(id)}
    containerB.appendChild(resume);

    var restart = document.createElement('button');
    restart.classList.add('restart');
    restart.innerHTML = 'Restart';
    restart.onclick = function () {startTimeR(id)}
    containerB.appendChild(restart);
    clearInterval(timers[id].interval);

    timers[id].elapsed += Date.now() - timers[id].start;
}

function resumeTimeR(id) {

    const container = document.querySelector(`#time_report_${id}`);
    const containerB = container.querySelector(`.actions`);

    if (!containerB) return

    containerB.innerHTML = ``;

    var pause = document.createElement('button');
    pause.classList.add('pause');
    pause.innerHTML = 'Pause';
    pause.onclick = function () {pauseTimeR(id)}
    containerB.appendChild(pause);

    const h = container.querySelector('.h');
    const m = container.querySelector('.m');
    const s = container.querySelector('.s');

    if (!timers[id]) return;

    timers[id].start = Date.now();

    timers[id].interval = setInterval(() => {

        const diff = Date.now() - timers[id].start + timers[id].elapsed;

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        h.textContent = String(hours).padStart(2, '0');
        m.textContent = String(minutes).padStart(2, '0');
        s.textContent = String(seconds).padStart(2, '0');

    }, 1000);
}
function closeTimeReport(id) {
    if (timers[id]) {
        if (timers[id].interval) {
            clearInterval(timers[id].interval);
            delete timers[id];
            document.getElementById(`time_report_${id}`).remove();
            idTimer--
        }
    } else {
        document.getElementById(`time_report_${id}`).remove();
        idTimer--
    }
}

function makeDraggable(classItem) {
    const windowEl = document.getElementById(`${classItem}_${idTimer}`);
    const header = windowEl.querySelector(`.${classItem}_header`);

    let offsetX = 0, offsetY = 0, isDragging = false;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;

        const rect = windowEl.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        document.querySelectorAll(`.${classItem}`).forEach(win => win.style.zIndex = 999); 
        windowEl.style.zIndex = 1000;
        header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        const maxX = window.innerWidth - windowEl.offsetWidth;
        const maxY = window.innerHeight - windowEl.offsetHeight;

        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > maxX) x = maxX;
        if (y > maxY) y = maxY;

        windowEl.style.left = x + 'px';
        windowEl.style.top = y + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        header.style.cursor = 'grab';
    });
}

document.addEventListener('DOMContentLoaded', function () {

    

})