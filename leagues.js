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

const updateMembersScoresInLeague = async function (leagueID, deltaArray) {
    for (let i=0; i<leagueScoresArray.length(); i++){
        leagueScoresArray[i] += deltaArray[i];
    }
    let leagueInfo = await dataBase(table).select('*').where('leagueid','=', leagueID).returning('*');
    let leagueScoresArray = JSON.parse(JSON.stringify(leagueInfo[0].members_scores_league));
    let newLeagueScoresArray = await leagueScoresArray.map( (score,i) => {
        return parseInt(score) + parseInt(deltaArray[i]);
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
        return cycles.getCyclesDB(req.params.id);
    }).then( answer2 => {
        data.cyclesDB = answer2;
        console.log("admin info 2", data);
        return games.getGamesDB(data.current_cycle_id);
    }).then ( answer3 => {
        data.gamesDB = answer3;
        console.log("admin info 3", data);
        res.send(data);
        res.end();        
    }).catch(err => {return err});
}

exports.getLeagueInfo = getLeagueInfo;
exports.updateMembersScoresInLeague = updateMembersScoresInLeague;
exports.leagueAdmin = leagueAdmin;
