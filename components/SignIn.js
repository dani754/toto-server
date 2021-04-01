const knex = require('knex');
const bcrypt = require('bcrypt');

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
