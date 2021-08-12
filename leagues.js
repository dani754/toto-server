const knex = require('knex');
const DBinfo = require('./DB_info');
const dataBase = knex(DBinfo.get());

const table = 'leagues_1';

const getLeagueInfo = (req,res) => {
    return dataBase.select('*').from(table)
    .where('leagueid','=',req.params.id).returning('*')
    .then( answer => {
        let league = answer[0];
        console.log("the league info sending is: ", league);
        res.send(league);
        res.end();
    }).catch(err => {return err});
}

exports.getLeagueInfo = getLeagueInfo;

