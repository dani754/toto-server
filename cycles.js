const knex = require('knex');
const DBinfo = require('./DB_info');
const dataBase = knex(DBinfo.get());

const games = require('./games');
const table = 'cycles_1';

const getCycleScores = (req,res) => {
    return dataBase.select('*').from(table)
    .where('cycleid','=',req.params.id).returning('*')
    .then( answer => {
        data = answer[0];
        console.log("the cycle scores is: ", data.members_scores_cycle);
        res.send(data.members_scores_cycle);
        res.end();        
    }).catch(err => {return err});
}

const getCycleData = (req,res) => {
    let data = {};
    return dataBase.select('*').from(table)
    .where('cycleid','=',req.params.id).returning('*')
    .then( answer => {
        data = answer[0];
        return games.getGamesDB(req.params.id);
    }).then ( answer1 => {
        data.gamesDB = answer1;
        console.log("the cycle and games info is: ", data);
        res.send(data);
        res.end();        
    }).catch(err => {return err});
}

exports.getCycleScores = getCycleScores;
exports.getCycleData = getCycleData;

