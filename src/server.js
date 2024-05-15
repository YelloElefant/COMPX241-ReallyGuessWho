const { Server, Origins } = require('boardgame.io/server');
const { GuessWho } = require('./Game');

const server = Server({
   games: [GuessWho],
   origins: [Origins.LOCALHOST],
});

server.run(8000);