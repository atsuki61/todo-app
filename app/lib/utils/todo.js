// DOM要素の取得
const newTaskInput = document.getElementById('new-task');
const addButton = document.getElementById('add-button');
const taskList = document.getElementById('task-list');
const tasksCounter = document.getElementById('tasks-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');

// ローカルストレージのキー
const STORAGE_KEY = 'todo-tasks';

// タスクの配列
let tasks = [];

// アプリの初期化
function initApp() {
    loadTasksFromStorage();
    renderTasks();
    attachEventListeners();
}

// イベントリスナーの設定
function attachEventListeners() {
    // 新しいタスク追加
    addButton.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // 完了したタスクのクリア
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);

    // フィルターボタン
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterTasks(btn.dataset.filter);
        });
    });
}

// 新しいタスクの追加
function addTask() {
    const taskText = newTaskInput.value.trim();
    if (taskText === '') return;

    const newTask = {
        id: Date.now().toString(),
        text: taskText,
        completed: false,
        createdAt: new Date()
    };

    tasks.push(newTask);
    newTaskInput.value = '';
    
    // フォーカスを入力フィールドに戻す
    newTaskInput.focus();
    
    saveTasksToStorage();
    renderTasks();
    
    // 追加アニメーション
    setTimeout(() => {
        const newTaskElement = document.querySelector(`[data-id="${newTask.id}"]`);
        if (newTaskElement) {
            newTaskElement.classList.add('highlight');
            setTimeout(() => {
                newTaskElement.classList.remove('highlight');
            }, 300);
        }
    }, 10);
}

// タスクの削除
function deleteTask(taskId) {
    const taskElement = document.querySelector(`[data-id="${taskId}"]`);
    
    // 削除アニメーション
    if (taskElement) {
        taskElement.style.opacity = '0';
        taskElement.style.transform = 'translateX(30px)';
        
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasksToStorage();
            renderTasks();
        }, 300);
    } else {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasksToStorage();
        renderTasks();
    }
}

// タスクの完了状態の切り替え
function toggleTaskStatus(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasksToStorage();
    renderTasks();
}

// 完了済みタスクのクリア
function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasksToStorage();
    renderTasks();
}

// タスクのフィルタリング
function filterTasks(filterType) {
    const allTasks = document.querySelectorAll('.task-item');
    
    allTasks.forEach(task => {
        const isCompleted = task.classList.contains('completed');
        
        switch(filterType) {
            case 'all':
                task.style.display = 'flex';
                break;
            case 'active':
                task.style.display = isCompleted ? 'none' : 'flex';
                break;
            case 'completed':
                task.style.display = isCompleted ? 'flex' : 'none';
                break;
        }
    });
}

// タスクのレンダリング
function renderTasks() {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <li class="empty-tasks">
                <p>タスクがありません。新しいタスクを追加してください。</p>
            </li>
        `;
    } else {
        // タスクを日付順にソート（新しい順）
        const sortedTasks = [...tasks].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        sortedTasks.forEach(task => {
            const taskElement = document.createElement('li');
            taskElement.classList.add('task-item');
            if (task.completed) {
                taskElement.classList.add('completed');
            }
            taskElement.dataset.id = task.id;
            
            taskElement.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            // イベントリスナーの追加
            const checkbox = taskElement.querySelector('.task-checkbox');
            const deleteBtn = taskElement.querySelector('.delete-btn');
            
            checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            taskList.appendChild(taskElement);
        });
    }
    
    // 未完了タスクのカウント更新
    const activeTasks = tasks.filter(task => !task.completed).length;
    tasksCounter.textContent = activeTasks;
    
    // 現在のフィルター状態を適用
    const activeFilter = document.querySelector('.filter-btn.active');
    if (activeFilter) {
        filterTasks(activeFilter.dataset.filter);
    }
}

// HTMLエスケープ処理
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ローカルストレージへの保存
function saveTasksToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ローカルストレージからの読み込み
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
        try {
            tasks = JSON.parse(storedTasks);
        } catch (e) {
            console.error('ローカルストレージからの読み込みに失敗しました:', e);
            tasks = [];
        }
    }
}

// アプリの初期化
document.addEventListener('DOMContentLoaded', initApp);
