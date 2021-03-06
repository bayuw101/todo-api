var Sequelize = require('sequelize');
var sequelize;
var env = process.env.NODE_ENV || 'development';
if (env === 'production') {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		'dialect': 'postgres'
	});
} else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/data-todo.sqlite'
	});
}

var db = {};

db.user = sequelize.import(__dirname + '/models/user.js');
db.todo = sequelize.import(__dirname + '/models/todo.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;