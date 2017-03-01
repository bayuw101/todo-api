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
	filteredTodos = todos;
	if (queryParams.hasOwnProperty('completed') && queryParams.completed === "false") {
		filteredTodos = _.where(todos, {
			completed: false
		});
	} else if ((queryParams.hasOwnProperty('completed') && queryParams.completed === "true")) {
		filteredTodos = _.where(todos, {
			completed: true
		});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(todos, function(params) {
			return params.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}

	res.json(filteredTodos);
});

app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id);
	var matchTodo = _.findWhere(todos, {
		id: todoId
	});

	if (matchTodo) {
		res.json(matchTodo);
	} else {
		res.status(404).send();
	};
});

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id);
	var matchTodo = _.findWhere(todos, {
		id: todoId
	});
	if (!matchTodo) {
		res.send(404).json([]);
	} else {
		todos = _.without(todos, matchTodo);
		res.json(todos);
	}
});

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'completed', 'description');

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed) && body.hasOwnProperty('description') && body.description.trim().length > 0 && _.isString(body.description)) {
		db.todo.create(body).then(function(todo) {
			console.log('data saved !');
			res.json(todo.toJSON());
		}).catch(function(e) {
			console.log(e);
			res.status(400).json(e);
		});
	}else{
		res.status(400).send('bad data !');
	}


	// var body = _.pick(req.body, 'completed', 'description');
	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
	// 	return res.status(400).send();
	// }
	// body.id = todosId++;
	// body.description = body.description.trim();
	// // push data
	// todos.push(body);
	// res.json(body);
});

app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id);
	var body = _.pick(req.body, 'completed', 'description');
	var matchTodo = _.findWhere(todos, {
		id: todoId
	});
	var validAttributes = {};

	if (!matchTodo) {
		res.status(404).send("Error while getting data !");
	} else {
		if (body.hasOwnProperty('completed') && _.isBoolean(body.completed) && body.hasOwnProperty('description') && body.description.trim().length > 0 && _.isString(body.description)) {
			validAttributes.completed = body.completed;
			validAttributes.description = body.description;
			_.extend(matchTodo, validAttributes);
			res.json(todos);
		} else if (body.hasOwnProperty('completed') || body.hasOwnProperty('description')) {
			return res.status(400).send("Getting bad response !");
		} else {
			return res.status(404).send("Page not found !");
		}
	}
});

db.sequelize.sync({force:true}).then(function() {
	app.listen(PORT, function() {
		console.log('Everything gonna be alright !');
	});
});