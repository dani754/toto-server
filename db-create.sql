create table user_login_1(
	userid serial primary key,
	username varchar(20) unique not NULL,
	password varchar not NULL
);

CREATE TABLE images(
	imgname text primary key,
	imgOID oid
);

create table user_info_1(
	userid int primary key,
	username varchar(20) not null,
	is_admin boolean default false,
	leagues int[],
	image text,
	foreign key (userid) references user_login_1 (userid),
	foreign key (image) references images (imgname)
);

update user_info_1 set is_admin=true where username='מנהל';

create table leagues_1(
	leagueid serial primary key,
	leaguename varchar(30) not null,
	members_ids int[],
	current_cycle_id int default 0,
	members_scores_league int[],
	members_names text[],
	cycles_ids int[]
);

insert into leagues_1 values(1,'טוטו שמש 2021-22',array[1,2,3,4,5,6,7,8,9], 1, array[0,0,0,0,0,0,0,0,0],array['אוהד','עמית','עידן','אור','רואי','דור','טוביה','ברגמן','רון'],array[1]);

create table cycles_1(
	cycleid serial primary key,
	leagueid int not null,
	games_ids int[],
	order_in_league int not null,
	lock_for_bets boolean default false,
	lock_for_updates boolean default false,
	lock_bets_time TIMESTAMP,
	members_scores_cycle int[],
	foreign key (leagueid) references leagues_1 (leagueid)
);

insert into cycles_1 values(1,1,array[1],1,false,false,null,array[0,0,0,0,0,0,0,0,0]);
update cycles_1 set lock_for_bets=false where cycleid=1;

create table games_1(
	gameid serial primary key,
	cycleid int not null,
	home_team varchar,
	away_team varchar,
	score int default 0,
	members_bets int[],
	is_bonus boolean default false,
	foreign key (cycleid) references cycles_1 (cycleid)
);

insert into games_1 values
(1,1,'לכיה אשל','עמית יונייטד',0,array[0,0,0,0,0,0,0,0,0],false),
(2,1,'ברנטפורד +1','ארסנל',0,array[0,0,0,0,0,0,0,0,0],false),
(3,1,'מנצ׳סטר יונייטד','לידס +1',0,array[0,0,0,0,0,0,0,0,0],false),
(4,1,'ברנלי','ברייטון',0,array[0,0,0,0,0,0,0,0,0],true),
(5,1,'צ׳לסי','קריסטל פאלאס +2',0,array[0,0,0,0,0,0,0,0,0],false),
(6,1,'אברטון','סאות׳המפטון +1',0,array[0,0,0,0,0,0,0,0,0],false),
(7,1,'לסטר','וולבס +1',0,array[0,0,0,0,0,0,0,0,0],false),
(8,1,'ווטפורד','אסטון וילה',0,array[0,0,0,0,0,0,0,0,0],false),
(9,1,'נוריץ׳ +2','ליברפול',0,array[0,0,0,0,0,0,0,0,0],false),
(10,1,'ניוקאסל','ווסטהאם',0,array[0,0,0,0,0,0,0,0,0],false),
(11,1,'טוטנהאם +1','מנצ׳סטר סיטי',0,array[0,0,0,0,0,0,0,0,0],false);

drop table games_1;


