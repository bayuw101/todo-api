var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect' : 'sqlite',
	'storage' : __dirname + '/my-challange.sqlite'
});

var Todo = sequelize.define('books', {
	title : {
		type : Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	availability : {
		type : Sequelize.BOOLEAN,
		defaultValue : false
	}
});

sequelize.sync({
	force : true
}).then(function(){
	console.log("all is synchronized !");

	Todo.create({
		title : false,
		availability : "dsfsdf"
	}).then(function(){
		return Todo.create({
			title : "Koala Kumal"
		});
	}).then(function(){
		return Todo.findAll({
			where : {
				title : {
					$like : '%koala%'
				}
			}
		});
	}).then(function(books){
		books.forEach(function(book){
			console.log(book.toJSON());	
		});
	}).catch(function(e){
		console.log('Error While Querying data !');
	});
});