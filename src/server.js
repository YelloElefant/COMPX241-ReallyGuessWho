const { Server, Origins } = require('boardgame.io/server');
const { GuessWho } = require('./Game');

const server = Server({
   games: [GuessWho],
   origins: [Origins.LOCALHOST],
});

const lobbyConfig = {
   apiPort: 8081,
   apiCallback: () => console.log('Running Lobby API on port 8080...'),
};

server.run({ port: 8000, lobbyConfig });
