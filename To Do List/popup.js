document.addEventListener('DOMContentLoaded', function() {
  const taskInput = document.getElementById('task-input');
  const taskTime = document.getElementById('task-time');
  const taskColor = document.getElementById('task-color');
  const addTaskButton = document.getElementById('add-task');
  const taskList = document.getElementById('task-list');
  const clearCompletedButton = document.getElementById('clear-completed');
  const deleteAllButton = document.getElementById('delete-all');

  addTaskButton.addEventListener('click', addTask);
  clearCompletedButton.addEventListener('click', clearCompletedTasks);
  deleteAllButton.addEventListener('click', deleteAllTasks);
  taskList.addEventListener('click', handleTaskClick);

  loadTasks();

  function addTask() {
    const taskText = taskInput.value.trim();
    const taskTimeValue = taskTime.value;
    const taskColorValue = taskColor.value;
    if (taskText === '' || taskTimeValue === '') return;

    const task = {
      text: taskText,
      time: taskTimeValue,
      color: taskColorValue,
      completed: false,
      pinned: false,
    };

    saveTask(task);
    taskInput.value = '';
    taskTime.value = '';
  }

  function saveTask(task) {
    chrome.storage.sync.get('tasks', function(data) {
      const tasks = data.tasks || [];
      tasks.push(task);
      chrome.storage.sync.set({ tasks: tasks }, function() {
        renderTasks(tasks);
      });
    });
  }

  function loadTasks() {
    chrome.storage.sync.get('tasks', function(data) {
      const tasks = data.tasks || [];
      renderTasks(tasks);
    });
  }

  function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.time.localeCompare(b.time);
    });

    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.dataset.index = index;
      li.style.backgroundColor = task.color;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.className = 'task-checkbox';

      const span = document.createElement('span');
      span.textContent = `${task.time} ${task.text}`;
      if (task.completed) span.classList.add('completed');
      if (task.pinned) span.classList.add('pinned');

      const pinButton = document.createElement('button');
      pinButton.textContent = task.pinned ? 'Unpin' : 'Pin';
      pinButton.className = 'pin-button';

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(pinButton);
      taskList.appendChild(li);
    });
  }

  function handleTaskClick(event) {
    const target = event.target;
    const li = target.closest('li');
    const index = li.dataset.index;

    chrome.storage.sync.get('tasks', function(data) {
      const tasks = data.tasks || [];

      if (target.classList.contains('task-checkbox')) {
        tasks[index].completed = target.checked;
      } else if (target.classList.contains('pin-button')) {
        tasks[index].pinned = !tasks[index].pinned;
      }

      chrome.storage.sync.set({ tasks: tasks }, function() {
        renderTasks(tasks);
      });
    });
  }

  function clearCompletedTasks() {
    chrome.storage.sync.get('tasks', function(data) {
      const tasks = data.tasks || [];
      const filteredTasks = tasks.filter(task => !task.completed);
      chrome.storage.sync.set({ tasks: filteredTasks }, function() {
        renderTasks(filteredTasks);
      });
    });
  }

  function deleteAllTasks() {
    chrome.storage.sync.set({ tasks: [] }, function() {
      renderTasks([]);
    });
  }
});
