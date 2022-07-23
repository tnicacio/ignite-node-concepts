const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userFound = users.find((user) => user.username === username);
  if (!userFound) {
    return response.status(404).json({ error: "User not found." });
  }
  request.user = userFound;
  return next();
}

function checksExistsToDo(request, response, next) {
  const { user } = request;
  const { id } = request.params;
  const todoFound = user.todos.find((todo) => todo.id === id);
  if (!todoFound) {
    return response.status(404).json({ error: "To-do not found!" });
  }
  request.todo = todoFound;
  return next();
}

function checkUsername(request, response, next) {
  const { username } = request.body;
  const userFound = users.find((user) => user.username === username);
  if (userFound) {
    return response.status(400).json({ error: "Username already taken!" });
  }
  return next();
}

app.post("/users", checkUsername, (request, response) => {
  const { name, username } = request.body;
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsToDo,
  (request, response) => {
    const { todo } = request;
    const { title, deadline } = request.body;
    todo.title = title;
    todo.deadline = new Date(deadline);
    return response.json(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksExistsToDo,
  (request, response) => {
    const { todo } = request;
    todo.done = true;
    return response.json(todo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsToDo,
  (request, response) => {
    const { user, todo } = request;
    user.todos = user.todos.filter((value) => value.id !== todo.id);
    return response.status(204).send();
  }
);

module.exports = app;
