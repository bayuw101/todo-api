var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

sequelize.sync({
	force: true
}).then(function() {
	console.log('Database synced !');
	Todo.create({
		description: "Take a bath"
	}).then(function(todo) {
		return Todo.create({
			description: "Go to Work !"
		});
	}).then(function() {
		// return Todo.findById(2);
		return Todo.findAll({
			where : {
				description : {
					$like : '%work%'
				}
			}
		});
	}).then(function(todos) {
		if (todos) {
			todos.forEach(function(todo){
				console.log(todo.toJSON());
			});
		} else {
			console.log('no todo found !');
		}
	}).catch(function(e) {
		console.log('error while querying !');
	});
}).catch(function(e) {
	console.log('error while scynchronizing !');
});