const knex = require('knex');
const DBinfo = require('./DB_info');
const dataBase = knex(DBinfo.get());

const table = 'leagues_1';

const getLeagueInfo = (leagueID) => {
    return dataBase.select('*').from(table)
    .where('leagueid','=',leagueID).returning('*')
    .then( answer => {
        let league = answer[0];
        console.log("the league info sending is: ", league);
        return league;
    }).catch(err => {return err});
}

exports.getLeagueInfo = getLeagueInfo;

