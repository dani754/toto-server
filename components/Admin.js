const knex = require('knex');
const DBinfo = require('./DBinfo');
const dataBase = knex(DBinfo.get());


const adminData = (req,res) => {
    let leagueInfo = {};
    dataBase.select('*').from('leagues').where('leagueid', req.params.id)
    .then((data) =>{
        leagueInfo = data[0];
        console.log('league data', leagueInfo);
        return leagueInfo.leagueid;
    }).then((data) => 
        dataBase.select('*').from('cycles')
        .where('leagueid', '=', data).orderBy('cycleorderinleague', 'desc').returning('*')
    ).then((data) => {
        leagueInfo.cyclesDB = data;
        return leagueInfo.leagueid;
    }).then((data) =>
        dataBase.select('*').from('games')
        .where('leagueid', '=', data).returning('*')
    ).then((data) => {
        leagueInfo.gamesDB = data;
        return leagueInfo;
    }).then((data) => {
        res.send(data);
        res.end();
    }).catch(err => res.status(400).json(err));
}

const changeLeagueName = (data) => {
    return dataBase('leagues').update({leaguename: data.newLeagueName})
        .where('leagueid', '=', data.leagueID).returning('*');
}

const updateCurrentCycle = (data) => {
    return dataBase('leagues').update({current_cycle: data.newCurrentCycle})
        .where('leagueid', '=', data.leagueID).returning('*');
}

const fullLeagueData = (leagueID) => {
    let cyclesDB = [];
    return dataBase.select('*').from('cycles')
    .where("leagueid", leagueID).returning('*')
    .then ( cycles => {
        cyclesDB = cycles;
        return  dataBase.select('*').from('leagues')
        .where("leagueid", leagueID).returning('*')
    }).then ( league => {
        let leagueData = league[0];
        leagueData.cyclesDB = cyclesDB;
        return leagueData;
    }).catch( err => {return err})
}

exports.getData = adminData;
exports.changeLeagueName = changeLeagueName;
exports.updateCurrentCycle = updateCurrentCycle;
exports.fullLeagueData = fullLeagueData;