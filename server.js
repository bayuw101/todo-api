var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todosId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res){
	res.send('oke');
});

app.get('/todos', function(req, res){
	res.json(todos);
});

app.get('/todos/:id', function(req, res){
	var todoId = req.params.id;
	var matchTodo;
	todos.forEach(function(todo){
		if(todoId == todo.id){
			matchTodo = todo;
		}
	});
	if(matchTodo){
		res.json(matchTodo);
	}else{
		res.status(404).send();
	};
});

app.post('/todos', function(req, res){
	var body = req.body;
	body.id = todosId++;
	todos.push(body);
	res.json(body);
});

app.listen(PORT,function(){
	console.log('Everything gonna be alright !');
});