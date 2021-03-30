import http from 'http';

import express from 'express';
const port = 3000;
const server = express();

server.get('/',(req,res) => {
  res.send({ some: 'json' })

});

server.listen(port, () => {
  console.log(`Server running at: local host port ${port}/`)
});