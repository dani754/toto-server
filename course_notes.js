import Express from 'express';

const server = Express();
const port = 3000;
let users = [{
    name: "danielle",
    id: 1,
    password: "apple",
}, {
    name: "ohad",
    id: 2,
    password: "hello",
}];

//body parser for post request (+CORS?)
server.use(Express.json()); 
server.use(Express.urlencoded({extended: true}));

//by id number in site adress, finds user info (localhost/signin/1 => send danielle obj)
server.get('/signin/:id', (req,res) => {
    res.json(users.find((user)=>{
        return +req.params.id === user.id
    }))
})
/**
//server.put() - similar to post:
//post - not working yet!!!

server.use((req, res, next) => { //express middleware
    console.log("andrei middleware")
    next();
})
server.get('/add', (req,res) => {
    res.json(users)
    console.log("get msg")
})
function mid(req, res, next) { //express middleware
    console.log(req.body);
    console.log(req.params);
    next();
}
server.post('/add', mid, (req,res) => {
    console.log("test")
    res.sendStatus(200);
}) 

server.get('/profile', (req,res) => {
    res.json(users.find((user)=>{
        return +req.params.id === user.id
    }))
})

server.post('/register', (req, res) => {
    users = users.concat([req.body]);
    res.send(users);
})

//server.delete()  **/

/** restful api
 * 
 * req.query - data through the url
 * req.body - data in the body of msg
 * req.headers - data in headers
 * req.param = in url ex. profile/:id when url profile/1
 * req.status etc..
 * 
 * send html file: app.use(express.static(__dirname + '/public'))
 * --> response: uploading the html file in public folder
 * 
 * file system:
 * const fs = require ('fs')
 * fs.readFile('./filename', (err, data) => {
 *  if (err) {
 *      res.status(400)}
 * else {res.send(data.toString())}
 * })
 * fs.appendFile - add text to file or create the text file
 * fs.writeFile - add a text file with the text we adding
 * fs.unlink - delete file
 * can help us proggram outside the browser ex. read an excel file and do automatic 
 */

server.listen(port, () => console.log("listening on port " + port));