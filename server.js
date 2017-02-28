var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

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

app.get('/todos/edit/:id', function(req, res){
	var todoId = parseInt(req.params.id);
	var matchTodo = _.findWhere(todos,{id:todoId});

	if(matchTodo){
		res.json(matchTodo);
	}else{
		res.status(404).send();
	};
});

app.delete('/todos/delete/:id', function(req, res){
	var todoId = parseInt(req.params.id);
	var matchTodo = _.findWhere(todos,{id:todoId});
	if(!matchTodo){
		res.send("Cannot find any data with those ID !");
	}else{
		todos = _.without(todos,matchTodo);
		res.json(todos);
	}
});

app.post('/todos', function(req, res){
	var body = _.pick(req.body, 'completed', 'description');
	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0 ){
		return res.status(400).send();
	}
	body.id = todosId++;
	body.description = body.description.trim();
	// push data
	todos.push(body);
	res.json(body);
});

app.listen(PORT,function(){
	console.log('Everything gonna be alright !');
});