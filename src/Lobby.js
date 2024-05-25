import { LobbyClient } from 'boardgame.io/client';

const lobbyClient = new LobbyClient({ server: 'http://192.168.1.29:8081' });

let temp = sessionStorage.getItem('playerCredentials');

console.log("temp: ", temp);
console.log("playerCredentials: ", sessionStorage.getItem('playerCredentials'));

updateList()

setInterval(updateList, 500);

document.getElementById('createGame').addEventListener('click', makeGame);

let storedName = sessionStorage.getItem('playerName');
storedName = storedName == undefined ? "" : storedName;
document.getElementById('playerName').value = storedName;


async function makeGame() {

   const { matchID } = await lobbyClient.createMatch("guesswho", {
      numPlayers: 2
   });
   console.log("matchID: ", matchID); // => '123'

   updateList()

}




async function updateList() {
   const playerName = document.getElementById('playerName').value.trim();

   const { matches } = await lobbyClient.listMatches('guesswho');

   const gameList = document.getElementById('gameList');
   gameList.innerHTML = '';
   let i = 1;
   for (const match of matches) {

      let playersCount = 0;

      let player1 = match.players[0];
      let player2 = match.players[1];

      if (player1.name !== undefined) { playersCount++; }
      if (player2.name !== undefined) { playersCount++; }

      let text = `<div class="matchWrapper"><div class="match">Match: ${i} - `;
      text += `Players: ${player1.name == undefined ? "xxx" : player1.name} , ${player2.name == undefined ? "xxx" : player2.name} - `;


      if (playersCount == 2) {
         text += `Status: Full`
      } else if (playersCount == 1) {
         text += `Status: Waiting for 1 player`
      } else {
         text += `Status: Waiting for 2 players`
      }
      text += `</div>`;

      if (((player1.name == playerName && !player1.isConnected) || (player2.name == playerName && !player2.isConnected)) && match.matchID == sessionStorage.getItem('matchID')) {
         text += `<button class="joinButton lobbyButton"  data-matchID="${match.matchID}">Rejoin</button></div>`;
      } else {
         text += `<button class="joinButton lobbyButton"  data-matchID="${match.matchID}">Join</button></div>`;
      }



      gameList.innerHTML += text;
      i++;
   }

   const handleJoin = async event => {
      if (event.target.innerHTML == "Rejoin") { window.location.href = "http://localhost:1234/GuessWho.html"; }
      const playerName = document.getElementById('playerName').value.trim();
      console.log(event.target.getAttribute('data-matchID'));
      const matchID = event.target.getAttribute('data-matchID');
      if (playerName == "") {
         alert("Please enter a name");
         return;
      }

      let playerId = await lobbyClient.getMatch("guesswho", matchID);
      if (playerId.players[0].name == undefined) {
         playerId = "0";
      } else {
         playerId = "1";
      }
      console.log("playerId: ", playerId);


      const { playerCredentials } = await lobbyClient.joinMatch(
         "guesswho",
         matchID,
         {
            playerID: playerId,
            playerName: playerName,
         }
      );


      sessionStorage.setItem('playerCredentials', playerCredentials);
      sessionStorage.setItem('playerName', playerName);
      sessionStorage.setItem('playerID', playerId);
      sessionStorage.setItem('matchID', matchID);

      window.location.href = "http://localhost:1234/GuessWho.html";
      updateList();
   }

   let joinButtons = document.getElementsByClassName("joinButton")
   for (let i = 0; i < joinButtons.length; i++) {
      joinButtons[i].addEventListener('click', handleJoin);
   }



}