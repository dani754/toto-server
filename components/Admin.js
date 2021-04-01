const knex = require('knex');


const dataBase = knex({
    client: 'pg',
    connection: {
        host : 'ec2-54-205-183-19.compute-1.amazonaws.com',
        user : 'vlyrqsdtpiptxa',
    password : '19a12f3687c95a25ab0874a147077f5f900c10000eecfda3725ed26a25cef8e0',
    database : 'db09ftu7rrhmil',
    ssl: { rejectUnauthorized: false }
    }
});

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