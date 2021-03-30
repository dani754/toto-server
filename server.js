const Express = require('express');
const cors = require('cors');
const knex = require('knex');

const SignIn = require('./components/SignIn');
const User = require( './components/User');
const LeagueDB = require( './components/LeagueDB');
const CycleDB = require( './components/CycleDB');
const gamesDB = require( './components/gamesDB');
const Admin = require( './components/Admin');


const server = Express();
const port = 3000;
const dataBase = knex({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        user : 'postgres',
    password : 'admin',
    database : 'postgres'
    }
});

server.use(cors());
server.use(Express.json()); 
server.use(Express.urlencoded({extended: true}));

server.post('/signin', (req,res) => {
    return SignIn.validation(req.body)
    .then ( data => {
        let user = data;
        console.log("returning from signin", user);
        return user.toString();
    }).then ( answer => {
        res.header("Access-Control-Allow-Origin", "*");
        res.send(answer);
        res.end();
    }).catch(err => res.sendStatus(400))
});

server.post('/register',(req,res) => {
    return SignIn.registration(req.body)
    .then ( data => {
        let user = data;
        console.log("returning from registration", user)
        return User.newUser(user, req.body.username)
    }).then ( answer => {
        let newUser = answer;
        console.log("the new user id sending is: ", newUser.userid);
        res.send(newUser.userid.toString());
        res.end();
    }).catch(err => res.sendStatus(400))
});
    
server.get('/home/user/:id', (req,res) => {
                                                          User.getData(req.params.id)
    .then ( data => {
        let user = data;
        console.log("the user info sending is: ", user);
        res.send(user);
        res.end();
    }).catch (err => res.sendStatus(400))
});

server.post('/joinLeague',(req,res) => {
    LeagueDB.newMember(req.body)
    .then ( data => {
        let user = data;
        console.log("the new members array in league is: ", user)
        if (user !== -1){
            return User.joinLeague(req.body)
        } else {
            return "-1";
        }
    }).then ( answer => {
        let result = answer[0].leagues;
        console.log("the new leagues array in user info is: ", result);
        res.send(result);
        res.end();
    }).catch(err => res.sendStatus(400))
});

server.get('/home/league/:id', (req,res) => {
    LeagueDB.getData(req,res);
});

server.post('/createleague', (req,res) => {
    return LeagueDB.createLeague(req.body)
    .then( answer => {
        console.log("the new league data sending is:", answer);
        res.send(answer[0]);
        res.end();
    }).catch(err => {return err});
});

server.get('/home/cycle/:id', (req,res) => {
    CycleDB.getData(req,res);
});

server.get('/home/leagueadmin/:id', (req,res) => {
    Admin.getData(req,res);
});
    

server.post('/updatebets', (req,res) => {
    gamesDB.updateBets(req.body)
    .then ( data => {
        let answer = data[0];
        console.log("the answer for update bets is: ", answer);
        res.send(answer);
        res.end();
    }).catch(err => res.status(400).json(err));
});

server.post('/updatescores', (req,res) => {
    return gamesDB.updateScores(req.body)
    .then ( data => {
        let answer = data;
        console.log("the answer for update scores is: ", answer);
        res.send(answer);
        res.end();
    }).catch(err => res.status(400).json(err));
});

server.post('/addgame', (req,res) => {
    return gamesDB.addGame(req.body)
    .then ( data => {
        let answer = data;
        console.log("the answer for addGame is: ", answer);
        res.send(answer);
        res.end();
    }).catch(err => res.status(400).json(err));
});

server.get('/deletegame/:id', (req,res) => {
    console.log("start deleteGame is")
    return gamesDB.deleteGame(req.params.id)
    .then ( data => {
        let answer = data;
        console.log("the answer for deleteGame is: ", answer);
        res.send(answer);
        res.end();
    }).catch(err => res.status(400).json(err));
});

server.get('/addcycle/:id', (req,res) => {
    CycleDB.addCycle(req,res);
});

server.get('/lockcycle/:id', (req,res) => {
    CycleDB.lockCycle(req,res);
});

server.get('/closecycle/:id', (req,res) => {
    CycleDB.closeCycle(req,res);
});


server.listen(port, () => console.log("listening on port " + port));
