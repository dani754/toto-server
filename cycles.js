const knex = require('knex');
const DBinfo = require('./DB_info');
const dataBase = knex(DBinfo.get());

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

exports.getCycleScores = getCycleScores;

