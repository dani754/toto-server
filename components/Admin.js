const Express = require('express');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt');

const dataBase = knex({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        user : 'postgres',
    password : 'admin',
    database : 'postgres'
    }
});


/* post methods */

/* get method */


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

exports.getData = adminData;