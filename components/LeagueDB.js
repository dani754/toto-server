const User = require( './User');
const knex = require('knex');
const DBinfo = require('./DBinfo');
const dataBase = knex(DBinfo.get());


const newMember = (data) => {
    return dataBase('leagues').select('*')
    .where('leagueid', data.leagueID).returning('*')
    .then( data2 => {
        let league = data2[0];
        console.log("league data in league db", league);
        return league;
    }).then ( league => {
        if (league.membersids !== null && league.membersids.indexOf(parseInt(data.userID)) === -1 && league.leaguename === data.leagueName){
            let IDs = league.membersids.concat([data.userID]);
            let names = league.names_array.concat([data.userName]).map( name => {
                return name.toString()
            });
            console.log("data in league db after concat", IDs, names )
            return dataBase('leagues').update({names_array: dataBase.raw('array_append(names_array, ?)', [data.userName])})
            .where('leagueid','=', data.leagueID).returning('*')
            .then ( answer => {
                return dataBase('leagues').update({membersids: dataBase.raw(`array[${IDs}]`)})
                .where('leagueid','=', data.leagueID).returning('*')
            });
        } else if (league.membersids === null  && league.leaguename === data.leagueName){
            return dataBase('leagues').update({membersids: dataBase.raw(`array[${data.userID}]`), names_array: dataBase.raw(`array['${data.userName}']`)})
            .where('leagueid','=', data.leagueID).returning('*');
        } else {
            return -1;
        }
    }).then ( league => {
        if (Array.isArray(league)){
            updateDataWhenAddingMember(league[0].leagueid);
            return league[0];
        } else
            return league;
    }).catch(err => {return err});
}

const updateDataWhenAddingMember = (leagueID) => {
    return dataBase('leagues').update({scores_array: dataBase.raw('array_append(scores_array, ?)', [0])})
        .where('leagueid','=', leagueID)
        .then( ()=> {
            return dataBase('cycles').update({membersscores: dataBase.raw('array_append(membersscores, ?)', [0])})
            .where('leagueid','=', leagueID)
        }).then( ()=> {
            return dataBase('games').update({membersbets: dataBase.raw('array_append(membersbets, ?)', [0])})
            .where('leagueid','=', leagueID)
        }).catch(err => {return err});
}

const createLeague = (info) => {
    return dataBase('leagues').insert({leaguename: info.leagueName, scoring_method: parseInt(info.scoringMethod), membersids: dataBase.raw(`array[${info.userID}]`), names_array: dataBase.raw(`array['${info.userName}']`), scores_array: dataBase.raw(`array[0]`)})
    .returning('*').then (league => {
        let newLeagueID = league[0].leagueid;
        console.log("the new league is:", league[0]);
        return dataBase('user_info').update({isadmin: newLeagueID})
        .where("userid", info.userID).returning('*')
    }).then ( user => { 
        return User.joinLeague({userID: info.userID, leagueID: user[0].isadmin})
    }).then( user1 => {
        let userData = user1[0];
        console.log("the admin data is:", userData);
        return dataBase('cycles').insert({leagueid: userData.isadmin, cycleorderinleague: 1, islocked: false, isclosed: false, membersscores: dataBase.raw(`array[0]`)})
        .returning('*')
    }).then (cycle => {
        let newCycleID = cycle[0].cycleid;
        console.log("the new cycle is:", cycle[0]);
        return dataBase('leagues').update({current_cycle: newCycleID, cyclesids: dataBase.raw(`array[${newCycleID}]`) })
        .where("leagueid", cycle[0].leagueid).returning('*')
    }).catch(err => {return err});
}

exports.newMember = newMember;
exports.createLeague = createLeague;