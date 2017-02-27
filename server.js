var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todo = [{
	id:1,
	description:'Register',
	completed:true
},
{
	id:2,
	description:'Fill up the form',
	completed:false
},
{
	id:3,
	description:'Email Confirmation',
	completed:false
}];

app.get('/todos', function(req, res){
	res.json(todo);
});

app.get('/todos/:id', function(req, res){
	var todoId = req.params.id
	var matchTodo;
	todo.forEach(function(t){
		if(t.id == todoId){
			matchTodo = t;
		}
	});
	if(matchTodo){
		res.json(matchTodo);
	}else{
		res.status(404).send();
	}
});

app.listen(PORT, function(){
	console.log('express listening on PORT ' + PORT);
});