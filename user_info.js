const knex = require('knex');
const DBinfo = require('./DB_info');
const dataBase = knex(DBinfo.get());

const table = 'user_info_1';

const register = (userID, userPublicName) => {
    return dataBase(table).insert({userid: userID, username: userPublicName, leagues: dataBase.raw(`array[1]`)}).returning('*')
    .then( answer => {
        let user = answer[0];
        console.log("new user in user info db", user);
        return user;
    }).catch(err => {return err});
}

exports.register = register;

