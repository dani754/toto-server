const knex = require('knex');
const DBinfo = require('./DB_info');
const dataBase = knex(DBinfo.get());

const leagues = require('./leagues');
const table = 'user_info_1';

const registeration = (userID, userPublicName) => {
    return dataBase(table).insert({userid: userID, username: userPublicName, leagues: dataBase.raw(`array[1]`)}).returning('*')
    .then( answer => {
        let user = answer[0];
        console.log("new user in user info db", user);
        return user;
    }).catch(err => {return err});
}

const getUserInfo = (req,res) => {
    let data = {};
    return dataBase.select('*').from(table)
    .where('userid','=',req.params.id).returning('*')
    .then( answer => {
        data = answer[0];
        return leagues.getLeagueInfo(1);
    }).then ( answer1 => {
        data.leagueData = answer1;
        console.log("the user and league info sending is: ", data);
        res.send(data);
        res.end();        
    }).catch(err => {return err});
}

exports.registeration = registeration;
exports.getUserInfo = getUserInfo;

