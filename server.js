var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todosId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('oke');
});

app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var queryParams = req.query;
	var where = {};

	if (queryParams.hasOwnProperty('completed')) {
		where.completed = queryParams.completed;
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {
		where.description = {
			$like: "%" + queryParams.q + "%"
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		var result = [];
		todos.forEach(function(todo) {
			result.push(todo.toJSON());
		});
		res.json(result);
	}).catch(function(e) {
		res.status(404).send();
	});
});

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = req.params.id;
	var todo = db.todo.findById(todoId).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}).catch(function(e) {
		res.status(500).send();
	});
});

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted <= 0) {
			res.status(404).json({
				error: "No Data Deleted !"
			});
		} else {
			res.status(204).send();
		}
	}).catch(function(e) {
		res.status(500).send();
	});
});

app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'completed', 'description');
	// body.userId = req.user.id;
	db.todo.create(body).then(function(todo) {
		// res.json(todo.toJSON());
		req.user.addTodo(todo).then(function(){
			return todo.reload();
		}).then(function(todo){
			res.json(todo.toJSON());
		});
	}).catch(function(e) {
		console.log(e);
		res.status(400).json(e);
	});
});

app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id);
	var body = _.pick(req.body, 'completed', 'description');

	db.todo.update(body, {
		where: {
			id: todoId
		}
	}).then(function(todo) {
		res.json(body);
	}, function(e) {
		res.status(400).json(e);
	}).catch(function(e) {
		res.status(500).send();
	});
});

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toJSON());
	}, function(e) {
		res.status(500).send(e);
	});
});

app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		if (token) {
			res.header('Auth', user.generateToken('authentication')).json(user.toJSON());
		}else{
			res.status(401).send(e);
		}
	}, function(e) {
		res.status(401).send(e);
	});
});

db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Everything gonna be alright !');
	});
});