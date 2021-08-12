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

const addGameToGamesIDsArray = (cycleID, gameID, isFirst) => {
    if (isFirst){
        return dataBase(table).update({ games_ids: dataBase.raw(`array[${gameID}]`)})
        .where('cycleid', '=', cycleID).returning('*')
        .catch(err => {return err});
    } else {
        return dataBase(table).update({ games_ids: dataBase.raw('array_append(games_ids, ?)', [gameID])})
        .where('cycleid', '=', cycleID).returning('*')
        .catch(err => {return err});
    }
}

const deleteGameFromGamesIDsArray = (cycleID, gameID) => {
    return dataBase(table).select('*').where('cycleid', '=', cycleID).returning('*')
    .then ( answer => {
        let gamesArray = answer[0].games_ids;
        const index = gamesArray.indexOf(gameID);
        if (index > -1) {
            gamesArray.splice(index, 1);
            return dataBase(table).update({games_ids: dataBase.raw(`array[${gamesArray}]`)})
            .where('cycleid', '=', cycleID).returning('*')
        } else
            return null;
    }).catch( err => {return err})
}


exports.getCycleScores = getCycleScores;
exports.getCycleData = getCycleData;
exports.addGameToGamesIDsArray = addGameToGamesIDsArray;
exports.deleteGameFromGamesIDsArray = deleteGameFromGamesIDsArray;

