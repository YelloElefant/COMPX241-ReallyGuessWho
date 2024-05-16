import { LobbyClient } from 'boardgame.io/client';

const lobbyClient = new LobbyClient({ server: 'http://localhost:8081' });

let temp = sessionStorage.getItem('playerCredentials');
console.log("temp: ", temp);
updateList()

document.getElementById('createGame').addEventListener('click', makeGame);

async function makeGame() {


   const playerId = document.getElementById('playerId').value;
   const name = document.getElementById('playerName').value;
   const gameName = document.getElementById('gameName').value;


   const { matchID } = await lobbyClient.createMatch('guesswho', {
      numPlayers: 2
   });
   console.log("matchID: ", matchID); // => '123'


   const { playerCredentials } = await lobbyClient.joinMatch(
      gameName,
      matchID,
      {
         playerID: playerId,
         playerName: name,
      }
   );

   updateList()

   sessionStorage.setItem('playerCredentials', playerCredentials);


}


async function updateList() {
   const { matches } = await lobbyClient.listMatches('guesswho');
   console.log("matches: ", matches); // => [{ matchID: '123', players: ['0', '1'] }, ...]

   const gameList = document.getElementById('gameList');
   gameList.innerHTML = '';
   for (const match of matches) {
      const game = document.createElement('li');
      game.appendChild(document.createTextNode(`Match ID: ${match.matchID} - Player ID: ${playerId} - Game: ${match.gameName}`));
      gameList.appendChild(game);
   }
}