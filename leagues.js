const knex = require('knex');
const DBinfo = require('./DB_info');
const dataBase = knex(DBinfo.get());

const cycles = require('./cycles');
const games = require('./games');
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

const updateMembersScoresInLeague = async function (leagueID, oldMembersScoresArray, newMembersScoresArray) {
    console.log("updateMembersScoresInLeague", leagueID, oldMembersScoresArray, newMembersScoresArray);
    let leagueInfo = await dataBase(table).select('*').where('leagueid','=', leagueID).returning('*');
    let leagueScoresArray = JSON.parse(JSON.stringify(leagueInfo[0].members_scores_league));
    let newLeagueScoresArray = await leagueScoresArray.map( (score,i) => {
        return parseInt(score) + newMembersScoresArray[i] - oldMembersScoresArray[i];
    });
    return dataBase(table).update({members_scores_league: dataBase.raw(`array[${newLeagueScoresArray}]`)})
    .where('leagueid', '=', leagueID).returning('*')
}

const leagueAdmin = (req,res) => {
    let data = {};
    return dataBase.select('*').from(table)
    .where('leagueid','=',req.params.id).returning('*')
    .then( answer => {
        data = answer[0];
        console.log("admin info 1", data);
        return cycles.getCyclesDB(data.leagueid);
    }).then( answer2 => {
        data.cyclesDB = answer2;
        console.log("admin info 2", data);
        return games.getGamesDB(parseInt(data.current_cycle_id));
    }).then ( answer3 => {
        data.gamesDB = answer3;
        console.log("admin info 3", data);
        res.send(data);
        res.end();        
    }).catch(err => {return err});
}

const addCycle = (req,res) => {
    let newCycle = 0;
    return dataBase.select('*').from(table)
    .where('leagueid', req.params.id).returning('*')
    .then( answer => {
        let league = answer[0];
        let membersCount = league.members_ids.length;
        let cycleOrder = league.cycles_ids.length + 1;
        console.log("add cycle with data", req.params.id, membersCount, cycleOrder );
        return cycles.addCycle(req.params.id, membersCount, cycleOrder);
    }).then( answer2 => {
        newCycle = answer2;
        return dataBase(table).update({cycles_ids: dataBase.raw('array_append(cycles_ids, ?)', [newCycle])})
        .where('leagueid', '=', req.params.id).returning('*')
    }).then( answer3 => {
        console.log("update data info", newCycle, answer3);
        res.send(newCycle.toString());
        res.end();
    }).catch(err => {return err});
}

const setCurrentCycle = (req,res) => {
    return dataBase(table).update({current_cycle_id: req.body.cycleid})
        .where('leagueid', '=', req.body.leagueid).returning('*')
        .then( answer => {
        console.log("update info", answer[0]);
        res.send(answer[0]);
        res.end();
    }).catch(err => res.status(400).json(err));
}


exports.getLeagueInfo = getLeagueInfo;
exports.updateMembersScoresInLeague = updateMembersScoresInLeague;
exports.leagueAdmin = leagueAdmin;
exports.addCycle = addCycle;
exports.setCurrentCycle = setCurrentCycle;
