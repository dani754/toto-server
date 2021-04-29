const knex = require('knex');
const DBinfo = require('./DBinfo');
const dataBase = knex(DBinfo.get());

const cycleData = (req,res) => {
    let cycle = {};
    dataBase.select('*').from('cycles')
    .where('cycleid', '=', req.params.id).returning('*')
    .then( data => {
        cycle = data[0];
        return cycle.cycleid;
    }).then ( data => 
    dataBase.select('*').from('games')
    .where('cycleid', '=', data).orderBy('gameid').returning('*')
    ).then (data => {
        cycle.gamesDB = data;
        console.log ("cycle data" , cycle);
        res.send(cycle);
        res.end();
    }).catch(err => res.status(400).json(err));
}

const addCycle = (req,res) => {
    return dataBase.select('*').from('leagues')
        .where('leagueid', req.params.id).returning('*')
    .then ( league => {
        let leagueData = league[0];
        console.log("before adding cycle", leagueData);
        return dataBase('cycles').insert({leagueid: leagueData.leagueid, cycleorderinleague: leagueData.cyclesids.length+1, 
            islocked: false, isclosed: false, membersscores: dataBase.raw(`array[${Array(leagueData.membersids.length).fill(0)}]`)})
            .returning('*')
    }).then ( cycle => {
        let newCycle = cycle[0];
        console.log("new cycle data", newCycle);
        return dataBase('leagues').update({cyclesids: dataBase.raw('array_append(cyclesids, ?)', [newCycle.cycleid])})
        .where('leagueid', req.params.id).returning('*')
    }).then (data => {
        console.log("after updating league data",data[0])
        res.send(data);
        res.end();
    }).catch(err => res.status(400).json(err));
}

const lockCycle = (req,res) => {
    return dataBase('cycles').update({islocked: true})
    .where('cycleid', req.params.id).returning('*')
    .then( (answer) => {
        console.log("after locking cycle",answer)
        res.send(answer);
        res.end();
    }).catch(err => res.status(400).json(err));
}

const updateCurrentCycle = (cycle) => {
    return dataBase('cycles').select('*').where({
        leagueid: cycle.leagueid,
        isclosed: false,
    }).returning('*').orderBy('cycleorderinleague')
    .then( cycleArray => {
        if (Array.isArray(cycleArray) && cycleArray.length > 0){
            let currentCycle = cycleArray[0];
            return dataBase('leagues').update({
                current_cycle: currentCycle.cycleid
            }).where('leagueid', cycle.leagueid).returning('*')
        } else {
            return ["no unclosed cycles"]
        }
    }).catch( err => {return err});
}

const closeCycle = (req,res) => {
    return dataBase('cycles').update({isclosed: true})
    .where('cycleid', req.params.id).returning('*')
    .then( (answer) => {
        return updateCurrentCycle(answer[0])
    }).then( data => {
        console.log("after closing cycle",data)
        res.send(data);
        res.end();
    }).catch(err => res.status(400).json(err));
}

const unCloseCycle = (cycleID) => {
    return dataBase('cycles').update({isclosed: false})
    .where('cycleid', '=', cycleID).returning('*')
}


const unLockCycle = (cycleID) => {
    return dataBase('cycles').update({islocked: false})
    .where('cycleid', '=', cycleID).returning('*')
}

const deleteGame = (gameInfo) => {
    console.log("game info to delete from cycle");
    return dataBase('cycles').select('*')
    .where('cycleid', gameInfo[0].cycleid).returning('*')
    .then( data => {
        let gamesArray = data[0].gamesids;
        const index = gamesArray.indexOf(gameInfo[0].gameid);
        if (index > -1) {
            gamesArray.splice(index, 1);
            return dataBase('cycles').update({gamesids: dataBase.raw(`array[${gamesArray}]`)})
            .where('cycleid', gameInfo[0].cycleid).returning('*')
        } else 
        return -1;
    }).catch( err => {return err})
}

const verifyBets = (req,res) => {
    return dataBase('games').select('*')
    .where('cycleid', req.params.id).returning('*')
    .then( (answer) => {
        console.log("games in cycle for verify bets",answer)
        let i;
        for (i=0; i<answer.length; i++){
            let array = answer[i].membersbets;
            if (array.indexOf(0) !== -1)
                return false;
        }
        if (i=== answer.length){
            return true;
        } 
    }).then( data => {
        console.log("the response for verify bets",data)
        res.send(data);
        res.end();
    }).catch(err => res.status(400).json(err));
}


exports.getData = cycleData;
exports.addCycle = addCycle;
exports.lockCycle = lockCycle;
exports.closeCycle = closeCycle;
exports.unCloseCycle = unCloseCycle;
exports.unLockCycle = unLockCycle;
exports.deleteGame = deleteGame;
exports.verifyBets = verifyBets;