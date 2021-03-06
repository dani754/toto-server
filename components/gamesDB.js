const knex = require('knex');
const DBinfo = require('./DBinfo');
const dataBase = knex(DBinfo.get());



const updateGames = (data) => {
    for (let i=0; i<data.gamesTable.length; i++){
        dataBase.select('membersbets').from('games').where('gameid', '=', data.gamesTable[i].gameID)
        .then((array) => {
            let newArray = array[0];
            newArray.membersbets[data.userIndex] = parseInt(data.gamesTable[i].userBet);
            console.log("new array of bets", newArray);
            return newArray;
        }).then((newArray)=>{
            let updatedArray = `array[${newArray.membersbets}]`;
            return dataBase.update({membersbets: dataBase.raw(updatedArray)}).table('games').where('gameid','=', data.gamesTable[i].gameID).returning('*');
        }).catch(err => console.log(err));
    }
    return dataBase.select('*').from('games').where('cycleid', '=', data.gamesTable[0].cycleid);
}

const updateBets = (data) => {
    return updateGames(data);
}

const updateScoresInGames = async function (data, scoresArrayForUpdate) {
    let newScoreUpdate = JSON.parse(JSON.stringify(scoresArrayForUpdate.membersscores));
    for (let i=0; i<data.gamesTable.length; i++){
        if (data.gamesTable[i].score !== parseInt(data.gamesTable[i].newScore)){
            await dataBase('games').update({score: parseInt(data.gamesTable[i].newScore)})
            .where('gameid', data.gamesTable[i].gameID).returning('*')
            .then( game => {
                let thisGame = game[0];
                let bets = thisGame.membersbets;
                console.log("this Game", thisGame);
                let point = 1;
                if (thisGame.isbonus)
                    point =2;
                for (let j=0; j<bets.length; j++){
                    if (parseInt(bets[j]) === parseInt(thisGame.score)){
                        newScoreUpdate[j] = parseInt(newScoreUpdate[j]) + point;
                    }
                    if (parseInt(bets[j]) === parseInt(data.gamesTable[i].score)){
                        newScoreUpdate[j] = parseInt(newScoreUpdate[j]) - point;
                    }
                }
            }).catch(err => console.log(err));
        }
    }
    console.log("update cycle Scores", scoresArrayForUpdate, newScoreUpdate);
    return newScoreUpdate;    
}

const updateScoresInLeague = async function (cycleArrays) {
    let scoreLeagueUpdate = await dataBase('leagues').select('*').where('leagueid', cycleArrays.leagueID).returning('scores_array');
    console.log("returning league Scores", scoreLeagueUpdate);
    scoreLeagueUpdate = scoreLeagueUpdate[0].scores_array;
    let newScoreLeagueUpdate = await scoreLeagueUpdate.map( (score,i) => {
        return (
            parseInt(score) + cycleArrays.newScore[i] - cycleArrays.oldScore[i]
        );
    });
    console.log("update league Scores", scoreLeagueUpdate, newScoreLeagueUpdate);
    return dataBase('leagues').update({scores_array: dataBase.raw(`array[${newScoreLeagueUpdate}]`)})
    .where('leagueid', cycleArrays.leagueID).returning('*')
}

const updateScores = (data) => {
    return dataBase('cycles').select('membersscores')
        .where('cycleid', data.cycleID).returning('*')
    .then ( scoresForUpdate => {
        console.log("returned from cycle before update", scoresForUpdate);
        return updateScoresInGames(data, scoresForUpdate[0])
        .then ( (newScoreUpdate) => {
            console.log("returned from updateScoresInGames", newScoreUpdate);
            return dataBase('cycles').update({membersscores: dataBase.raw(`array[${newScoreUpdate}]`)})
            .where('cycleid', data.cycleID).returning('*')
        }).then ( cycle => {
            console.log("returned from cycle update", cycle);
            let scoresArrayAfterUpdate = cycle[0];
            return ({oldScore: scoresForUpdate[0].membersscores,
                newScore: scoresArrayAfterUpdate.membersscores,
                leagueID: scoresArrayAfterUpdate.leagueid})
        }).catch(err => {return err})
    }).then ( cycleArrays => {
        console.log("returned from cycleArrays", cycleArrays);
        return updateScoresInLeague(cycleArrays)
    }).catch(err => {return err});
}



exports.updateBets = updateBets;
exports.updateScores = updateScores;

