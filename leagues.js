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

exports.getLeagueInfo = getLeagueInfo;
exports.updateMembersScoresInLeague = updateMembersScoresInLeague;
