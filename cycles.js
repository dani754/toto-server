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

const updateMembersScoresInCycle = (newMembersScoresArray, cycleID) => {
    return dataBase(table).update({members_scores_cycle: dataBase.raw(`array[${newMembersScoresArray}]`)})
    .where('cycleid', '=', cycleID).returning('*');
}

const updateScores = (req,res) => {
    let leagueID = 0;
    let oldMembersScoresArray = [];
    return dataBase(table).select('*').where('cycleid','=',req.body.cycleID).returning('*')
    .then( cycle => {
        leagueID = cycle[0].leagueid;
        oldMembersScoresArray = cycle[0].members_scores_cycle;
        return games.updateScoresInGames(oldMembersScoresArray, req.body.gamesTable);
        }).then( answer => {
        return updateMembersScoresInCycle(answer, req.body.cycleID); 
    }).then( answer2 => {
        return leagues.updateMembersScoresInLeague(leagueID, oldMembersScoresArray, answer2[0].members_scores_cycle);
    }).then( answer3 => {
        res.send(answer3);
        res.end();        
    }).catch(err => {return err});
}

const getCyclesDB = (leagueID) => {
    return dataBase.select('*').from(table)
    .where('leagueid', '=', leagueID).returning('*')
    .catch(err => {return err});
}

const addCycle = (leagueID, membersCount, cycleOrder) => {
    console.log("add cycle in cycles data", leagueID, membersCount, cycleOrder, `array[${Array(membersCount).fill(0)}]`);
    return dataBase(table).returning('*')
    .insert({leagueid: leagueID, order_in_league: cycleOrder,
        members_scores_cycle: dataBase.raw(`array[${Array(membersCount).fill(0)}]`)})
    .then( answer => {
        console.log("add cycle with data", answer[0]);
        return answer[0].cycleid;
    }).catch(err => {return err});
}

const lockForBets = (req,res) => {
    return dataBase(table).update({lock_for_bets: true})
    .where('cycleid', '=', req.params.id).returning('*')
    .then( answer => {
        res.send(answer[0]);
        res.end();
    }).catch(err => {return err});
}

const unlockForBets = (req,res) => {
    return dataBase(table).update({lock_for_bets: false})
    .where('cycleid', '=', req.params.id).returning('*')
    .then( answer => {
        res.send(answer[0]);
        res.end();
    }).catch(err => {return err});
}

const lockForUpdates = (req,res) => {
    return dataBase(table).update({lock_for_updates: true})
    .where('cycleid', '=', req.params.id).returning('*')
    .then( answer => {
        res.send(answer[0]);
        res.end();
    }).catch(err => {return err});
}

const unlockForUpdates = (req,res) => {
    return dataBase(table).update({lock_for_updates: false})
    .where('cycleid', '=', req.params.id).returning('*')
    .then( answer => {
        res.send(answer[0]);
        res.end();
    }).catch(err => {return err});
}


exports.getCycleScores = getCycleScores;
exports.getCycleData = getCycleData;
exports.addGameToGamesIDsArray = addGameToGamesIDsArray;
exports.deleteGameFromGamesIDsArray = deleteGameFromGamesIDsArray;
exports.updateScores = updateScores;
exports.getCyclesDB = getCyclesDB;
exports.addCycle = addCycle;
exports.lockForBets = lockForBets;
exports.unlockForBets = unlockForBets;
exports.lockForUpdates = lockForUpdates;
exports.unlockForUpdates = unlockForUpdates;

