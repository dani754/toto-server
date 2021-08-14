const Express = require('express');
const cors = require('cors');
const path = require('path');

const User = require( './components/User');
const LeagueDB = require( './components/LeagueDB');
const CycleDB = require( './components/CycleDB');
const gamesDB = require( './components/gamesDB');
const Admin = require( './components/Admin');

const userLogin = require('./user_login');
const userInfo = require('./user_info');
const leagues = require('./leagues');
const cycles = require('./cycles');
const games = require('./games');

const server = Express();
const PORT = process.env.PORT ||5000;

server.use(cors());
server.use(Express.json()); 
server.use(Express.urlencoded({extended: true}));
server.use(Express.static(path.join(__dirname, 'public')));
server.set('view engine', 'ejs');

server.get('/', (req,res) => {
    res.send("hello world");
})

server.post('/signin', (req,res) => {
    return userLogin.logIn(req,res)
    .catch(err => res.sendStatus(400))
});

server.post('/register',(req,res) => {
    return userLogin.register(req,res)
    .catch(err => res.sendStatus(400))
});

server.get('/home/user/:id', (req,res) => {
    return userInfo.getUserInfo(req,res)
    .catch (err => res.sendStatus(400))
});

server.get('/home/get-cycle-scores/:id', (req,res) => {
    return cycles.getCycleScores(req,res)
    .catch (err => res.sendStatus(400))
});

server.get('/home/cycle/:id', (req,res) => {
    return cycles.getCycleData(req,res)
    .catch (err => res.sendStatus(400))
});

server.post('/updatebets', (req,res) => {
    games.updateBets(req,res)
    .catch (err => res.sendStatus(400))
});

server.post('/addgame', (req,res) => {
    return games.addGame(req,res)
    .catch (err => res.sendStatus(400));
});

server.get('/deletegame/:id', (req,res) => {
    return games.deleteGame(req,res)
    .catch (err => res.sendStatus(400));
});

server.get('/bonusgame/:id', (req,res) => {
    return games.bonusGame(req,res)
    .catch (err => res.sendStatus(400));
});

server.get('/unbonusgame/:id', (req,res) => {
    return games.unbonusGame(req,res)
    .catch (err => res.sendStatus(400));
});


server.post('/updatescores', (req,res) => {
    return cycles.updateScores(req,res)
    .catch (err => res.sendStatus(400));
});

server.get('/leagueadmin/:id', (req,res) => {
    return leagues.leagueAdmin(req,res)
    .catch (err => res.sendStatus(400));
});


//todo


server.get('/home/leagueadmin/:id', (req,res) => {
    return Admin.fullLeagueData(req.params.id)
    .then ( answer => {
        console.log("fullLeagueData", answer);
        res.send(answer);
        res.end();
    }).catch(err => res.sendStatus(400))
});


server.post('/createleague', (req,res) => {
    return LeagueDB.createLeague(req.body)
    .then( answer => {
        console.log("the new league data sending is:", answer);
        res.send(answer[0]);
        res.end();
    }).catch(err => {return err});
});





server.post('/changeleaguename', (req,res) => {
    console.log("changeleaguename", req.body);
    return Admin.changeLeagueName(req.body)
    .then ( data => {
        let answer = data;
        console.log("the answer for changeLeagueName is: ", answer);
        res.send(answer);
        res.end();
    }).catch(err => res.status(400).json(err));
});

server.post('/updatecurrentcycle', (req,res) => {
    console.log("updatecurrentcycle", req.body);
    return Admin.updateCurrentCycle(req.body)
    .then ( data => {
        let answer = data;
        console.log("the answer for updateCurrentCycle is: ", answer);
        res.send(answer);
        res.end();
    }).catch(err => res.status(400).json(err));
});






server.get('/unclosecycle/:id', (req,res) => {
    console.log("start unclosecycle is")
    return CycleDB.unCloseCycle(req.params.id)
    .then ( data => {
        let answer = data;
        console.log("the answer for unCloseCycle is: ", answer);
        res.send(answer);
        res.end();
    }).catch(err => res.status(400).json(err));
});

server.get('/unlockcycle/:id', (req,res) => {
    console.log("start unlockcycle is")
    return CycleDB.unLockCycle(req.params.id)
    .then ( data => {
        let answer = data;
        console.log("the answer for unLockCycle is: ", answer);
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

server.get('/verifybets/:id', (req,res) => {
    CycleDB.verifyBets(req,res);
});

server.get('/closecycle/:id', (req,res) => {
    CycleDB.closeCycle(req,res);
});


server.listen(PORT, () => console.log("listening on port " + PORT));
