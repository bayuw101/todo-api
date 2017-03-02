var bcrypt = require('bcrypt');
var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		salt: DataTypes.STRING,
		password_hash: DataTypes.STRING,
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function(value) {
				var salt = bcrypt.genSaltSync(10);
				var hash = bcrypt.hashSync(value, salt);

				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hash);
				this.setDataValue('password', value);
			}
		}
	}, {
		hooks: {
			beforeValidate: function(value, options) {
				if (typeof value.email === 'string') {
					value.email = value.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authencticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					}
					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
							return reject();
						}
						resolve(user);
					}, function() {
						return reject();
					});
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
			}
		}
	});

	return user;
}