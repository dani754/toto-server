const knex = require('knex');
const DBinfo = require('./DBinfo');
const dataBase = knex(DBinfo.get());
const bcrypt = require('bcrypt');

const validation = (userInfo) => {
    return dataBase.select('*').from('user_login')
    .where('email', '=', userInfo.email).returning('*')
    .then (data => {
        let user = data[0];
        console.log('userInfo and user', userInfo, user);
        if (user.userid > 1 && bcrypt.compareSync(userInfo.password, user.hash)) 
            {return user.userid;}
        else if (user.userid === 1 && userInfo.password === user.hash ){
            return user.userid;}
        else {
            return -1;}
    }).catch(err => {return err});
}

const registration = (userInfo) => {
    return dataBase.select('*').from('user_login')
    .where('email', '=', userInfo.email).returning('*')
    .then (data => {
        if (data.toString() === ''){
            let hash = bcrypt.hashSync(userInfo.password, 10);
            return dataBase('user_login').insert({email: userInfo.email, hash: hash, username: userInfo.username})
            .returning('*').then( answer => {
                let newUser = answer[0];
                console.log("new user in user login db", newUser);
                return newUser.userid;
            }).catch(err => console.log('unable to validate', err));
        } else {
            return 0;
        }
    }).catch(err => {return err});
}


exports.validation = validation;
exports.registration = registration;
