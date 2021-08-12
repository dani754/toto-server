const knex = require('knex');
const DBinfo = require('./DB_info');
const dataBase = knex(DBinfo.get());

const table = 'games_1';

const getGamesDB = (cycleID) => {
    return dataBase.select('*').from(table)
    .where('cycleid','=',cycleID).returning('*')
    .catch(err => {return err});
}

exports.getGamesDB = getGamesDB;

