import { LobbyClient } from 'boardgame.io/client';

const lobbyClient = new LobbyClient({ server: 'http://localhost:8081' });

let temp = sessionStorage.getItem('playerCredentials');
console.log("temp: ", temp);
updateList()

document.getElementById('createGame').addEventListener('click', makeGame);
document.getElementById('joinGame').addEventListener('click', joinGame);



async function makeGame() {



   const gameName = document.getElementById('gameNameCreate').value;


   const { matchID } = await lobbyClient.createMatch(gameName, {
      numPlayers: 2
   });
   console.log("matchID: ", matchID); // => '123'

   updateList()

}

async function joinGame() {
   const gameName = document.getElementById('gameNameJoin').value;
   const playerId = document.getElementById('playerId').value;
   const matchID = document.getElementById('matchId').value;
   const playerName = document.getElementById('playerName').value;

   const { playerCredentials } = await lobbyClient.joinMatch(
      gameName,
      matchID,
      {
         playerID: playerId,
         playerName: playerName,
      }
   );


   sessionStorage.setItem('playerCredentials', playerCredentials);
   window.location.href = "http://localhost:1234/GuessWho.html";
   updateList();
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