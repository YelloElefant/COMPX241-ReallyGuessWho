import { LobbyClient } from 'boardgame.io/client';

const lobbyClient = new LobbyClient({ server: 'http://localhost:8081' });


async function matches() {

   lobbyClient.listGames()
      .then(console.log) // => ['chess', 'tic-tac-toe']
      .catch(console.error);


   const gameId = 'guesswho';

   const { matchID } = await lobbyClient.createMatch('guesswho', {
      numPlayers: 2
   });
   console.log("matchID: ", matchID); // => '123'


   const { matches } = await lobbyClient.listMatches('guesswho');
   console.log("matches: ", matches); // => [{ matchID: '123', players: ['0', '1'] }, ...]
   const playerId = await prompt("Player ID: ");
   const name = await prompt("Name: ");


   const { playerCredentials } = await lobbyClient.joinMatch(
      gameId,
      matchID,
      {
         playerID: playerId,
         playerName: name,
      }
   );

   console.log("playerCredentials: ", playerCredentials); // => '123-456'

   const gameList = document.getElementById('gameList');

   for (const match of matches) {
      const game = document.createElement('li');
      game.appendChild(document.createTextNode(`Match ID: ${match.matchID} - Player ID: ${playerId} - Game: ${match.gameName}`));
      gameList.appendChild(game);
   }

}

matches();


