class Model {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    }

    async getAuthors() {
        this.authors = await fetch('https://jsonplaceholder.typicode.com/users');
        this.authors = await this.authors.json();
        return this.authors;
    }

    deleteTodo(id) {
        id = Number(id.split('todo-id-')[1]);
        this.todos = this.todos.filter((todo) => todo.id !== id);
        this.updateLocalStorage();
    }

    addTodo(todoText, author, deadline) {
        const todo = {
            id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
            text: todoText,
            author: author,
            complete: false,
            deadline: deadline,
        };
        this.todos.push(todo);
        this.updateLocalStorage();
    }

    toggleTodo(id) {
        id = Number(id.split('todo-id-')[1]);
        this.todos = this.todos.map(todo => {
            if (todo.id === id) {
                return {
                    id: todo.id,
                    text: todo.text,
                    author: todo.author,
                    complete: !todo.complete,
                    deadline: todo.deadline
                }
            }
            return todo
        });

        this.updateLocalStorage();
    }

    updateLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    get lastTodo() {
        return this.todos[this.todos.length - 1];
    }
}

class View {
    constructor() {
        this.todoList = document.querySelector('#todo-list');
        this.newTodoInput = document.getElementById('new-todo');
        this.select = document.getElementById('user-todo');
        this.addTodo = document.getElementById('add-todo');
        this.deadline = document.getElementById('deadline');
    }

    renderAuthors(authors) {
        authors.forEach(author => {
            this.select.insertAdjacentHTML('beforeend', `
                <option value="${author.name}">${author.name}</option> 
            `);
        });
    }

    renderTodos(todos) {
        todos.forEach(todo => {
            this.renderTodo(todo);
        });
    }

    renderTodo(todo) {
        if (!todo) return;
        this.todoList.insertAdjacentHTML('beforeend', `
                <li id="todo-id-${todo.id}" class="todo-item ${todo.complete ? 'completed': ''}">
                    <input type="checkbox" ${todo.complete ? 'checked': ''}>
                    <div>
                        <p>${todo.text} by <span class="author">${todo.author}</span></p>
                        <p class="date">${todo.deadline === 'Invalid Date' ? '': todo.deadline}</p>
                    </div>
                    <span class="close">&times;</span>                
                </li>
        `);
    }

    removeTodo(id) {
        const todo = this.todoList.querySelector(`#${id}`);
        todo.remove();
    }

    toggleTodo(id) {
        const todo = this.todoList.querySelector(`#${id}`);
        todo.classList.toggle('completed');
    }

    get todoInputText() {
        return this.newTodoInput.value;
    }

    set todoInputText(value) {
        this.newTodoInput.value = value;
    }

    get selectedValue() {
        return this.select.options[this.select.selectedIndex].value;
    }

    get deadlineValue() {
        return new Date(this.deadline.value).toLocaleString();
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.init();
    }

    init() {
        this.model.getAuthors().then((response) => this.view.renderAuthors(response));
        this.view.renderTodos(this.model.todos);

        this.createNewTodo = this.createNewTodo.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);
        this.completedTodo = this.completedTodo.bind(this)

        this.view.addTodo.addEventListener('click', this.createNewTodo);

        this.view.todoList.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', this.deleteTodo)
        });

        this.view.todoList.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.addEventListener('click', this.completedTodo)
        })
    }

    createNewTodo(event) {
        event.preventDefault();
        const text = this.view.todoInputText;
        const author = this.view.selectedValue;
        const deadline = this.view.deadlineValue;

        if (!text || author === 'select user') return;

        this.model.addTodo(text, author,deadline);
        this.view.todoInputText = '';
        this.view.renderTodo(this.model.lastTodo);

        document.querySelector(`#todo-id-${this.model.lastTodo.id}`)
            .querySelector('.close').addEventListener('click', this.deleteTodo);

        document.querySelector(`#todo-id-${this.model.lastTodo.id}`)
            .querySelector('input[type="checkbox"]').addEventListener('click', this.completedTodo);
    }

    deleteTodo(event) {
        const idTodo = event.currentTarget.parentNode.getAttribute('id');
        this.model.deleteTodo(idTodo);
        this.view.removeTodo(idTodo);
        this.removeEventsTodo(event.currentTarget.parentNode);
    }

    completedTodo(event) {
        const idTodo = event.currentTarget.parentNode.getAttribute('id');
        this.model.toggleTodo(idTodo);
        this.view.toggleTodo(idTodo);
    }

    removeEventsTodo(todo) {
        todo.querySelector('.close').removeEventListener('click',this.deleteTodo)
        todo.querySelector('input[type="checkbox"]').removeEventListener('click',this.completedTodo)
    }
}

const app = new Controller(new Model(), new View());
