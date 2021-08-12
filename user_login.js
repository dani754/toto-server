const knex = require('knex');
const DBinfo = require('./DB_info');
const dataBase = knex(DBinfo.get());
const bcrypt = require('bcrypt');

const userInfo = require('./user_info');
const table = 'user_login_1'; 

const logIn = (req,res) => {
    return dataBase.select('*').from(table)
    .where('username', '=', req.body.username).returning('*')
    .then (answer => {
        let user = answer[0];
        if (bcrypt.compareSync(req.body.password, user.password)){
            res.header("Access-Control-Allow-Origin", "*");
            res.send(user.userid.toString());
            res.end();
        } else {
            res.header("Access-Control-Allow-Origin", "*");
            res.send("0");
            res.end();
        }
    }).catch(err => {return err});
}

const register = (req,res) => {
    return dataBase.select('*').from(table)
    .where('username', '=', req.body.username).returning('*')
    .then (answer => {
        if (answer.toString() === ''){
            let hash = bcrypt.hashSync(req.body.password, 10);
            return dataBase(table).insert({username: req.body.username, password: hash}).returning('*')
            .then( answer1 => {
                let newUser = answer1[0];
                console.log("new user in user login db", newUser);
                return userInfo.register(newUser.userid, req.body.publicName);
            }).then( data => {
                res.header("Access-Control-Allow-Origin", "*");
                res.send(data.userid.toString());
                res.end();
            }).catch(err => {return err});
        } else {
            res.header("Access-Control-Allow-Origin", "*");
            res.send("0");
            res.end();
        }
    }).catch(err => {return err});
}

exports.logIn = logIn;
exports.register = register;