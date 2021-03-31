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


const validation = (userInfo) => {
    return dataBase.select('*').from('user_login')
    .where('email', '=', userInfo.email).returning('*')
    .then (data => {
        let user = data[0];
        console.log('userInfo and user', userInfo, user);
        if (user.userid > 4 && bcrypt.compareSync(userInfo.password, user.password)) 
            {return user.userid;}
        else if (user.userid <= 4 && userInfo.password === user.password ){
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
            return dataBase('user_login').insert({email: userInfo.email, password: hash})
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
