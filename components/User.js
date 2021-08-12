const knex = require('knex');
const DBinfo = require('./DBinfo');
const dataBase = knex(DBinfo.get());

const userData = (userID) => {
    return dataBase.select('*').from('user_info')
    .where('userid', '=', userID).returning('*')
    .catch(err => {return err});
}

const joinLeague = (data) => {
    return dataBase('user_info').select('*')
    .where('userid', data.userID).returning('*')
    .then( data2 => {
        let user = data2[0];
        console.log("user data in user info db", user);
        return user.leagues;
    }).then ( array => {
        console.log("old leagues array in user db", array);
        if (array !== null && array[0] !== 0 && array.indexOf(parseInt(data.leagueID)) === -1){
            let newArray = array.concat([data.leagueID]);
            console.log("new array in user db", newArray);
            return dataBase('user_info').update({leagues: dataBase.raw(`array[${newArray}]`)})
            .where('userid','=', data.userID).returning('*');
        } else if (array === null || array[0] === 0){
            let newArray = [].concat([data.leagueID]);
            return dataBase('user_info').update({leagues: dataBase.raw(`array[${newArray}]`), defaultleague: data.leagueID})
            .where('userid','=', data.userID).returning('*');
        } else {
            return data2[0];
        }
    }).catch(err => {return err});
}

exports.getData = userData;
exports.newUser = newUser;
exports.joinLeague = joinLeague;