const knex = require('knex');
const DBinfo = require('./DB_info');
const dataBase = knex(DBinfo.get());

const games = require('./games');
const leagues = require('./leagues');
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

const updateMembersScoresInCycle = async function  (oldMembersScoresArray,newMembersScoresArray, cycleID){
    let deltaArrayForLeague = newMembersScoresArray;
    for (let i=0; i<deltaArrayForLeague; i++){
        deltaArrayForLeague[i] -= oldMembersScoresArray[i];
    }
    await dataBase(table).update({members_scores_cycle: dataBase.raw(`array[${newMembersScoresArray}]`)})
    .where('cycleid', '=', cycleID).returning('*')
    .then( answer => {
        return deltaArrayForLeague;
    }).catch(err => console.log(err));
}

const updateScores = (req,res) => {
    let scoresTable = req.body.gamesTable;
    let leagueID = 0;
    let oldMembersScoresArray = [];
    return dataBase(table).select('*').where('cycleid','=',req.body.cycleID).returning('*')
    .then( cycle => {
        leagueID = cycle[0].leagueid;
        oldMembersScoresArray = JSON.parse(JSON.stringify(cycle.members_scores_cycle));
        return games.updateGamesScores(oldMembersScoresArray, scoresTable);
    }).then( answer => {
        return updateMembersScoresInCycle(oldMembersScoresArray, answer ,req.body.cycleID); 
    }).then( answer2 => {
        return leagues.updateMembersScoresInLeague(leagueID, answer2); //delta array
    }).then( answer3 => {
        res.send(answer3);
        res.end();        
    }).catch(err => {return err});
}


exports.getCycleScores = getCycleScores;
exports.getCycleData = getCycleData;
exports.addGameToGamesIDsArray = addGameToGamesIDsArray;
exports.deleteGameFromGamesIDsArray = deleteGameFromGamesIDsArray;
exports.updateScores = updateScores;

