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

      let playersCount = 0;

      let player1 = match.players[0];
      let player2 = match.players[1];

      if (player1.name !== undefined) { playersCount++; }
      if (player2.name !== undefined) { playersCount++; }

      let text = `Match ID: ${match.matchID} - Game: ${match.gameName} - `;
      text += `Players: ${player1.name == undefined ? "xxx" : player1.name} , ${player2.name == undefined ? "xxx" : player2.name} - `;


      if (playersCount == 2) {
         text += `Status: Full`
      } else {
         text += `Status: Waiting for 1 player}`
      }

      game.appendChild(document.createTextNode(text));
      gameList.appendChild(game);
   }
}