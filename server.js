var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todosId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('oke');
});

app.get('/todos', function(req, res) {
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

app.get('/todos/:id', function(req, res) {
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

app.delete('/todos/:id', function(req, res) {
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

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'completed', 'description');
	db.todo.create(body).then(function(todo) {
		console.log('data saved !');
		res.json(todo.toJSON());
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

//usre
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}).catch(function(e) {
		res.status(500).send(e);
	});
});

app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authencticate(body).then(function(user){
		res.json(user.toPublicJSON());
	},function(){
		res.status(401).send();
	});

});

db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Everything gonna be alright !');
	});
});