const knex = require('knex');
const DBinfo = require('./DB_info');
const dataBase = knex(DBinfo.get());

const table = 'games_1';

const getGamesDB = (cycleID) => {
    return dataBase.select('*').from(table)
    .where('cycleid','=',cycleID).returning('*')
    .catch(err => {return err});
}

const updateGamesBets = (data) => {
    for (let i=0; i<data.gamesTable.length; i++){
        dataBase.select('members_bets').from('games').where('gameid', '=', data.gamesTable[i].gameID)
        .then((array) => {
            let newArray = array[0];
            newArray.members_bets[data.userIndex] = parseInt(data.gamesTable[i].userBet);
            console.log("new array of bets", newArray);
            return newArray;
        }).then((newArray)=>{
            let updatedArray = `array[${newArray.members_bets}]`;
            return dataBase.update({members_bets: dataBase.raw(updatedArray)}).table('games').where('gameid','=', data.gamesTable[i].gameID).returning('*');
        }).catch(err => console.log(err));
    }
    return dataBase.select('*').from('games').where('cycleid', '=', data.gamesTable[0].cycleid);
}

const updateBets = (req,res) => {
    return updateGamesBets(req.body)
    .then ( answer => {
        let data = answer[0];
        console.log("the answer for update bets is: ", data);
        res.send(data);
        res.end();
    }).catch(err => console.log(err));
}

exports.getGamesDB = getGamesDB;
exports.updateBets = updateBets;

