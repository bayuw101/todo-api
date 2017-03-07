var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

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
			set: function(value) {
				var salt = bcrypt.genSaltSync(10);
				var password_hash = bcrypt.hashSync(value, salt);

				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', password_hash);
				this.setDataValue('password', value);
			}
		}
	}, {
		hooks: {
			beforeValidate: function(value, options) {
				value.email = value.email.toLowerCase();
			}
		},
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email === 'string' && typeof body.password === 'string') {
						user.findOne({
							where: {
								'email': body.email
							}
						}).then(function(user) {
							if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
								reject('user cannot define !');
							}
							resolve(user);
						}).catch(function(e) {
							reject(e);
						});
					}
				});
			}
		},
		instanceMethods: {
			generateToken: function(type) {
				if (!_.isString(type)) {
					console.log('here error');
					return undefined;
				}
				try {
					var stringData = JSON.stringify({
						id: this.get('id'),
						type: type
					});
					var encryptedData = cryptojs.AES.encrypt(stringData, 'okebayu').toString();
					var token = jwt.sign({
						token : encryptedData
					}, 'bayuoke');
					return token;
				} catch (e) {
					console.log(e);
					return undefined;
				}
			}
		}
	});
	return user;
}