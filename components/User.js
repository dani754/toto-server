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

const userData = (userID) => {
    return dataBase.select('*').from('user_info')
    .where('userid', '=', userID).returning('*')
    .catch(err => {return err});
}

const newUser = (userID, userName) => {
    return dataBase('user_info').insert({userid: userID, username: userName})
    .returning('*').then( data => {
        let user = data[0];
        console.log("new user in user info db", user);
        return user;
    }).catch(err => {return err});
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
        if (array !== null && array.indexOf(parseInt(data.leagueID)) === -1){
            let newArray = array.concat([data.leagueID]);
            console.log("new array in user db", newArray);
            return dataBase('user_info').update({leagues: dataBase.raw(`array[${newArray}]`)})
            .where('userid','=', data.userID).returning('*');
        } else if (array === null){
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