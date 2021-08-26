const knex = require('knex');
const { getCycleScores } = require('./cycles');
const DBinfo = require('./DB_info');
const dataBase = knex(DBinfo.get());

const cycles = require('./cycles');
const table = 'games_1';

const getGamesDB = (cycleID) => {
    return dataBase.select('*').from(table)
    .where('cycleid','=',cycleID).returning('*')
    .catch(err => {return err});
}

const updateGamesBets = (data) => {
    for (let i=0; i<data.gamesTable.length; i++){
        dataBase.select('members_bets').from(table).where('gameid', '=', data.gamesTable[i].gameID)
        .then((array) => {
            let newArray = array[0];
            newArray.members_bets[data.userIndex] = parseInt(data.gamesTable[i].userBet);
            console.log("new array of bets", newArray);
            return newArray;
        }).then((newArray)=>{
            let updatedArray = `array[${newArray.members_bets}]`;
            return dataBase.update({members_bets: dataBase.raw(updatedArray)}).table(table).where('gameid','=', data.gamesTable[i].gameID).returning('*');
        }).catch(err => console.log(err));
    }
    return dataBase.select('*').from(table).where('cycleid', '=', data.gamesTable[0].cycleid);
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

const addGame = (req,res) => {
    return dataBase(table).returning('*')
        .insert({cycleid: req.body.cycleID, home_team: req.body.hometeam, away_team: req.body.awayteam,
            members_bets: dataBase.raw(`array[${Array(req.body.leagueSize).fill(0)}]`)})
    .then( answer => {
        let game = answer[0];
        console.log("new addgame", game);
        return cycles.addGameToGamesIDsArray(game.cycleid, game.gameid, req.body.isFirst);
    }).then( answer2 => {
        console.log("finish addgame", answer2);
        res.send(answer2[0]);
        res.end();
    }).catch(err => {return err});
}



const gamesArray = async function (homeArr, awayArr, cycleID, leagueSize){
    return homeArr.map( (game,i) => {
        return ({
            cycleid: parseInt(cycleID),
            home_team: parseInt(homeArr[i]),
            away_team: parseInt(awayArr[i]),
            members_bets: await dataBase.raw(`array[${Array(leagueSize).fill(0)}]`)
        });
    });   
}

const addGames = (req,res) => {
    return gamesArray(req.body.hometeam, req.body.awayteam, req.body.cycleID, req.body.leagueSize)
    .then( answer => {
        console.log("data addgame", answer);
        return dataBase(table).returning('*').insert(answer);
    }).then( answer2 => {
        console.log("new addgame", answer2);
        return cycles.addGamesToCycleGamesArray(answer);
    }).then( answer3 => {
        console.log("finish addgame", answer3);
        res.send(answer3[0]);
        res.end();
    }).catch(err => {return err});
}


const deleteGame = (req,res) => {
    return dataBase(table).where('gameid', '=', parseInt(req.params.id)).returning('*').del()
    .then( answer => {
        let game = answer[0];
        return cycles.deleteGameFromGamesIDsArray(game.cycleid, game.gameid);
    }).then( answer2 => {
        if (answer2){
            res.send(answer2[0]);
            res.end();
        } else
            res.sendStatus(400);     
    }).catch(err => {return err});
}

const bonusGame = (req,res) => {
    return dataBase(table).update({is_bonus: true}).where('gameid', '=', parseInt(req.params.id)).returning('*')
    .then( answer => {
        res.send(answer[0]);
        res.end();
    }).catch(err => {return err});
}

const unbonusGame = (req,res) => {
    return dataBase(table).update({is_bonus: false}).where('gameid', '=', parseInt(req.params.id)).returning('*')
    .then( answer => {
        res.send(answer[0]);
        res.end();
    }).catch(err => {return err});
}

const updateScoresInGames = async function (oldMembersScoresArray, scoresTable) {
    let membersScoresCycle = JSON.parse(JSON.stringify(oldMembersScoresArray));
    for (let i=0; i<scoresTable.length; i++){
        if (scoresTable[i].score !== scoresTable[i].newScore){
            await dataBase(table).update({score: scoresTable[i].newScore})
            .where('gameid', scoresTable[i].gameID).returning('*')
            .then( game => {
                let thisGame = game[0];
                let bets = thisGame.members_bets;
                let point = 1;
                if (thisGame.is_bonus)
                    point =2;
                for (let j=0; j<bets.length; j++){
                    if (parseInt(bets[j]) === parseInt(thisGame.score)){
                        membersScoresCycle[j] = parseInt(membersScoresCycle[j]) + point;
                    }
                    else if (parseInt(scoresTable[i].score) !==0 && parseInt(bets[j]) === parseInt(scoresTable[i].score)){
                        membersScoresCycle[j] = parseInt(membersScoresCycle[j]) - point;
                    }
                }
            });
        }
    }
    console.log("update cycle Scores", membersScoresCycle);
    return membersScoresCycle;
}

//delete


const updateScoresInLeague = async function (cycleArrays) {
    let scoreLeagueUpdate = await dataBase('leagues_1').select('*').where('leagueid', cycleArrays.leagueID).returning('members_scores_league');
    console.log("returning league Scores", scoreLeagueUpdate);
    scoreLeagueUpdate = scoreLeagueUpdate[0].members_scores_league;
    let newScoreLeagueUpdate = await scoreLeagueUpdate.map( (score,i) => {
        return (
            parseInt(score) + cycleArrays.newScore[i] - cycleArrays.oldScore[i]
        );
    });
    console.log("update league Scores", scoreLeagueUpdate, newScoreLeagueUpdate);
    return dataBase('leagues_1').update({members_scores_league: dataBase.raw(`array[${newScoreLeagueUpdate}]`)})
    .where('leagueid', cycleArrays.leagueID).returning('*')
}

const updateScores = (req,res) => {
    let data = req.body;
    return dataBase('cycles_1').select('members_scores_cycle')
        .where('cycleid', data.cycleID).returning('*')
    .then ( scoresForUpdate => {
        console.log("returned from cycle before update", scoresForUpdate);
        return updateScoresInGames(data, scoresForUpdate[0])
        .then ( (newScoreUpdate) => {
            console.log("returned from updateScoresInGames", newScoreUpdate);
            return dataBase('cycles_1').update({members_scores_cycle: dataBase.raw(`array[${newScoreUpdate}]`)})
            .where('cycleid', data.cycleID).returning('*')
        }).then ( cycle => {
            console.log("returned from cycle update", cycle);
            let scoresArrayAfterUpdate = cycle[0];
            return ({oldScore: scoresForUpdate[0].members_scores_cycle,
                newScore: scoresArrayAfterUpdate.members_scores_cycle,
                leagueID: scoresArrayAfterUpdate.leagueid})
        }).catch(err => {return err})
    }).then ( cycleArrays => {
        console.log("returned from cycleArrays", cycleArrays);
        return updateScoresInLeague(cycleArrays)
    }).then (answer3 => {
        console.log("return to front updating scores", answer3);
        res.send(answer3);
        res.end();
    }).catch(err => {return err});
}


exports.getGamesDB = getGamesDB;
exports.updateBets = updateBets;
exports.addGame = addGame;
exports.deleteGame = deleteGame;
exports.bonusGame = bonusGame;
exports.unbonusGame = unbonusGame;
exports.updateScoresInGames = updateScoresInGames;
exports.addGames = addGames;
