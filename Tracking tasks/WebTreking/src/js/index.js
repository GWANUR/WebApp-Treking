function loadPage(page) {
    fetch(`../../pages/${page}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Page not found");
            }
            return response.text();
        })
        .then(data => {
            document.getElementById("content").innerHTML = data;

            // Сохраняем активную страницу в localStorage
            localStorage.setItem('activePage', page);

            // Если это страница traking — загружаем JSON
            if (page === "traking") {
                loadTrekingData();
                searchFolder();
            }

            // Обновляем класс active у кнопок меню
            document.querySelectorAll("header nav button").forEach(btn => {
                btn.classList.remove("active");
            });
            const activeBtn = document.querySelector(`header nav button[data-page="${page}"]`);
            if (activeBtn) activeBtn.classList.add("active");
        })
        .catch(error => {
            document.getElementById("content").innerHTML =
                "<h2>Ошибка загрузки страницы</h2>";
            console.error(error);
        });
}

function makeDraggable(windowId) {
    const windowEl = document.getElementById(windowId);
    const header = windowEl.querySelector('.task-window-header');

    let offsetX = 0, offsetY = 0, isDragging = false;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;

        const rect = windowEl.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        document.querySelectorAll('.task-window').forEach(win => win.style.zIndex = 999); 
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

function saveNewFoldername(folderElement) {
    const input = folderElement.querySelector('input.folder_name');
    const newname = input.value.trim();

    if (!newname) {
        alert('The folder name cannot be empty!');
        return;
    }

    fetch('src/php/save.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newname })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Успешно: обновляем название в DOM
            folderElement.querySelector('.folder_name').textContent = newname;
            loadTrekingData();
        } else {
            // ❌ Ошибка от сервера — выводим пользователю
            alert(data.error || "Неизвестная ошибка при сохранении папки");
        }
    })
    .catch(error => {
        // Ошибка запроса (например сервер не доступен)
        console.error(error);
        alert("Ошибка сети или сервера. Смотрите консоль для деталей.");
    });
}

function addFolder() {
    document.querySelector('.folderNotFound')?.remove(); // Удаляем сообщение, если оно есть
    var treking = document.querySelector('.container_folder_treking')
    if (treking.querySelector('.new_folder')) return;
    var newFolder = document.createElement('div');
    newFolder.classList.add('new_folder');
    newFolder.classList.add('folder');
    newFolder.innerHTML = `
        <input type="text" class="folder_name" placeholder="Add a new folder..." value="New folder"> 
        <button onclick="event.stopPropagation(); saveNewFoldername(this.parentElement)">Save</button>
        <button onclick="event.stopPropagation(); loadTrekingData()">Undo</button>
    `;
    treking.appendChild(newFolder);
}

function loadData() {
    fetch('src/data/treking.JSON')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки файла');
            }
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => console.error('Ошибка:', error));
}

function searchFolder() {
    const inputFolderSerach = document.querySelector('.header-treking input.searchFolder');

    inputFolderSerach.addEventListener('input', (e) => {
        if (e.target.value.trim() === '') {
            loadTrekingData(); 
        } else {
            loadTrekingData(e.target.value.trim()); 
        }
    });
}

function loadTrekingData(foldername) {
    fetch('src/data/treking.JSON')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки файла');
            }
            return response.json();
        })
        .then(data => {
            const folders = data.FOLDER;
            const container = document.querySelector('.container_folder_treking');
            container.innerHTML = ''; // Очищаем контейнер перед загрузкой данных
            if (!folders || !folders.length) {
                container.innerHTML = '<p class="folderNotFound">No folders found.</p>';
                return;
            }
            if (!foldername){
                folders.forEach((folder, index) => {
                    const name = folder.name;
                    const tasks = folder.tasks || {};
                    const taskArray = Array.isArray(tasks) ? tasks : Object.values(tasks);

                    const totalTasks = taskArray.length;
                    const readyTasks = taskArray.filter(task => task.status).length;

                    container.innerHTML += `
                        <tr onclick="loadWindowTasks(${index + 1})" class="folder" id="folder-${index + 1}">
                            <th class="left">
                                <span class="folder_name">${name}</span>
                            </th>
                            <th class="info_folder">
                                <span class="tasks_count">Tasks: ${totalTasks}</span>
                                <span class="tasks_ready">Ready: ${readyTasks}</span>
                            </th>
                            <th class="active">
                                <button class="rename" onclick="event.stopPropagation(); renameFolder(${index + 1})">
                                    <i class="bi bi-pencil"></i> Rename
                                </button>
                                <button class="remove" onclick="event.stopPropagation(); removeFolder(${index + 1},'${name}')">
                                    <i class="bi bi-trash3"></i> Remove
                                </button>
                            </th>
                        </tr>
                    `;
                });
            } else {
                folders.forEach((folder, index) => {
                    const name = folder.name;
                    const tasks = folder.tasks || {};
                    const taskArray = Array.isArray(tasks) ? tasks : Object.values(tasks);

                    const totalTasks = taskArray.length;
                    const readyTasks = taskArray.filter(task => task.status).length;
                    if (folder.name.toLowerCase().includes(foldername.toLowerCase())) {
                        container.innerHTML += `
                            <tr onclick="loadWindowTasks(${index + 1})" class="folder" id="folder-${index + 1}">
                                <th class="left">
                                    <span class="folder_name">${name}</span>
                                </th>
                                <th class="info_folder">
                                    <span class="tasks_count">Tasks: ${totalTasks}</span>
                                    <span class="tasks_ready">Ready: ${readyTasks}</span>
                                </th>
                                <th class="active">
                                    <button class="rename" onclick="event.stopPropagation(); renameFolder(${index + 1})">
                                        <i class="bi bi-pencil"></i> Rename
                                    </button>
                                    <button class="remove" onclick="event.stopPropagation(); removeFolder(${index + 1},'${name}')">
                                        <i class="bi bi-trash3"></i> Remove
                                    </button>
                                </th>
                            </tr>
                        `;
                    }
                })
            }
        })
        .catch(error => console.error('Ошибка:', error));
}

function removeFolder(index, nameFolder) {

    AlertComponent.show({
        message: `Are you sure you want to delete "${nameFolder}" folder?`,
        type: "choice",

        onAccept: () => {

            fetch('src/php/remove.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ index: index })
            })
            .then(res => res.json())
            .then(data => {

                if (data.success) {
                    loadTrekingData();
                }

            })
            .catch(error => console.error('Ошибка:', error));

        },

        onCancel: () => {
            console.log("Удаление отменено");
        }

    });

}

function renameFolder(index) {
    const folderElement = document.getElementById(`folder-${index}`);
    const nameElement = folderElement.querySelector('.folder_name');
    const currentname = nameElement.textContent;
    nameElement.innerHTML = `
    <input type="text" class="folder_rename" placeholder="Rename folder..." value="${currentname}" onclick="event.stopPropagation()" onmousedown="event.stopPropagation()" onkeydown="event.stopPropagation()">
    <button onclick="event.stopPropagation(); saveRenamedFolder(${index}, this.parentElement.querySelector('input').value)">Save</button>
    <button onclick="event.stopPropagation();loadTrekingData()">Undo</button>
    `;
    const input = nameElement.querySelector('input');
    input.focus();
    input.select();
}

function saveRenamedFolder(index, newname) {
    if (!newname.trim()) {
        alert('The folder name cannot be empty!');
        return;
    }
    fetch('src/php/rename.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ index: index, newname: newname })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadTrekingData();
            }
        })
        .catch(error => console.error('Ошибка:', error));
}

function loadWindowTasks(folderIndex) {
    var taskWindow = document.createElement('div');
    taskWindow.classList.add('task-window');
    taskWindow.id = `task-window-${folderIndex}`;
    if (document.getElementById(taskWindow.id)) return; 
    taskWindow.innerHTML = `
        <div class="task-window-header">
            <span class="WindowFoldername"></span>
            <button onclick="event.stopPropagation(); closeWindow('${taskWindow.id}')"><i class="bi bi-x-circle"></i></button>
        </div>
        <div class="task-window-content"></div>
        <div class="task-window-footer">
            <button class="openTrack" onclick="openTrack(${folderIndex})"><i class="bi bi-clipboard2-data-fill"></i></button>
            <button class="addTask" onclick="addTask(${folderIndex},'${taskWindow.id}')"><i class="bi bi-plus-circle-fill"></i></button>
        </div>
    `;
    document.body.appendChild(taskWindow);
    makeDraggable(taskWindow.id);
    loadTasks(folderIndex);
}
function openTrack(folderIndex) {
    const url = `pages/tracking/tracking.php?folderIndex=${folderIndex}`;
    window.open(url, '_blank');
    const ThisWindow = document.getElementById(`task-window-${folderIndex}`);
    if (ThisWindow) {
        ThisWindow.remove(); 
    }
}
function addTask(folderIndex, windowId) {
    const windowEl = document.getElementById(windowId);
    const content = windowEl.querySelector('.task-window-content');
    var newTask = document.createElement('div');
    newTask.classList.add('new_task');
    newTask.innerHTML = `
        <input type="text" class="task_name" placeholder="Add a new task..." value="New task"> 
        <button onclick="event.stopPropagation(); saveNewTask(${folderIndex}, this.parentElement.querySelector('input').value)">Save</button>
        <button onclick="event.stopPropagation(); loadTasks(${folderIndex})">Undo</button>
    `;
    content.appendChild(newTask);
}
function saveNewTask(folderIndex, taskname) {
    if (!taskname.trim()) {
        alert('The task name cannot be empty!');
        return;
    }
    fetch('src/php/addTask.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folderIndex: folderIndex-1, taskname: taskname })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadTasks(folderIndex);
                loadTrekingData();
            } else {
                alert(data.message || "Неизвестная ошибка при добавлении задачи");
            }
        })
        .catch(error => console.error('Ошибка:', error));
}
function loadTasks(folderIndex) {
    fetch('src/data/treking.JSON')
        .then(response => {
            if (!response.ok) throw new Error('Ошибка загрузки файла');
            return response.json();
        })
        .then(data => {
            const folder = data.FOLDER[folderIndex - 1];
            if (!folder || !folder.tasks) return;

            let tasks = [];
            if (Array.isArray(folder.tasks)) {
                tasks = folder.tasks;
            } else if (typeof folder.tasks === 'object') {
                tasks = Object.values(folder.tasks);
            }

            const content = document.querySelector(`#task-window-${folderIndex} .task-window-content`);
            const foldernameEl = document.querySelector(`#task-window-${folderIndex} .WindowFoldername`);
            foldernameEl.textContent = folder.name;
            content.innerHTML = '';

            tasks.forEach((task, taskIndex) => {
                const taskname = task.name || `Task ${taskIndex + 1}`;
                const status = task.status || false;

                content.innerHTML += `
                    <div class="task-item">
                        <span>${taskname}</span>
                        <button class="toggleTask ${status ? 'ready' : 'notready'}"
                            onclick="toggleTaskStatus(${folderIndex}, ${taskIndex})">
                            ${status ? '<i class="bi bi-check-circle-fill"></i>' : '<i class="bi bi-circle"></i>'}
                        </button>
                    </div>
                `;
            });

        })
        .catch(error => console.error('Ошибка:', error));
}

function toggleTaskStatus(folderIndex, taskIndex) {
    fetch('src/php/toggleTask.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderIndex, taskIndex })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadTasks(folderIndex);
                loadTrekingData();
            }
        })
        .catch(error => console.error('Ошибка:', error));
}

function closeWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (windowEl) {
        windowEl.remove();
    }
}

function openAllReminder(type){
    const remindWinEl = document.querySelector('#reminder_container')
    const listRem = remindWinEl.querySelector('.reminder_window')
    const buttonRem = remindWinEl.querySelector('.reminder_button')

    if (type === 'load'){
        listRem.innerHTML = '';
        fetch(`src/data/treking.JSON`)
        .then(response => response.json())
        .then(data => {

            data.FOLDER.forEach((folder, folderIndex) => {
                folder.tasks.forEach((task, taskIndex) => {

                    if (task.data && task.time){
                        const taskRemEL = document.createElement('div')
                        taskRemEL.className = `reminder_item`
                        taskRemEL.id = `reminder_item_${folderIndex}_${taskIndex}`

                        taskRemEL.innerHTML = `
                            <div class="reminder_item_info">
                                <span class="name">${task.name}</span>
                                <div class="date_remind">
                                    <span class="date">${task.data}</span>
                                    <span class="time">${task.time}</span> 
                                </div>
                                <div class="remButton">
                                    <button class="remButtonEl" onclick="removeReminder(${folderIndex}, ${taskIndex})">
                                        <i class="bi bi-bell-slash-fill"></i>
                                    </button>
                                </div>
                            </div>
                        `;

                        taskRemEL.onclick = function () {
                            const url = `/pages/tracking/tracking.php?folderIndex=${folderIndex+1}#task_${taskIndex}`;
                            window.open(url, '_blank');
                        }
                        listRem.appendChild(taskRemEL)
                    }
                })
            })
        })
    }
    if (type === 'open'){
        listRem.style.left = 'auto';
        listRem.style.right = '0%';

        buttonRem.querySelector('.all_reminder').remove();
        const newBatton = document.createElement('button');
        newBatton.className = "all_reminder_close";
        newBatton.innerHTML = `<i class="bi bi-bell"></i>`
        newBatton.onclick = function(){
            openAllReminder('close')
        }
        buttonRem.appendChild(newBatton)
    }
    if (type === 'close'){
        listRem.style.right = 'auto';
        listRem.style.left = '100%';

        buttonRem.querySelector('.all_reminder_close').remove();
        const newBatton = document.createElement('button');
        newBatton.className = "all_reminder";
        newBatton.innerHTML = `<i class="bi bi-bell-fill"></i>`
        newBatton.onclick = function(){
            openAllReminder('open')
        }
        buttonRem.appendChild(newBatton)
    }

}

document.addEventListener("DOMContentLoaded", () => {
    openAllReminder('load')

    const lastPage = localStorage.getItem('activePage') || 'home';
    loadPage(lastPage);

    var treking = document.querySelector('.treking__warp')

    document.querySelectorAll("header nav button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll("header nav button").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });

});