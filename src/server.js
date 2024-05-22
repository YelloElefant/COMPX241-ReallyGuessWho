const { Server, Origins } = require('boardgame.io/server');
const { GuessWho } = require('./Game');







const server = Server({
   games: [GuessWho],
   origins: [
      'https://yelloelefant.com',
      Origins.LOCALHOST,
      Origins.SAME_IP,
      Origins.LOCALHOST_IN_DEVELOPMENT,
      'https://guesswho.yelloelefant.com',
      'https://guesswhoserver.yelloelefant.com',
      'https://guesswholobby.yelloelefant.com',
      'http://localhost'
   ],
});

const lobbyConfig = {
   apiPort: 8081,
   apiCallback: () => console.log('Running Lobby API on port 8080...'),
};

server.run({ port: 8000, lobbyConfig });
