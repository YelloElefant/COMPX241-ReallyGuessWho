import { Client } from 'boardgame.io/client';
import { GuessWho } from './Game';
import { SPARQLQueryDispatcher } from './SPARQLQueryDispatcher';
import request from 'request';
import { SocketIO } from 'boardgame.io/multiplayer'
import { LobbyClient } from 'boardgame.io/client';

const lobbyClient = new LobbyClient({ server: 'http://192.168.1.29:8081' });



class GuessWhoClient {

    constructor(rootElement, imagesList, matchID, playersNames, playerCredentials, { playerID } = {}) {
        this.client = Client({
            numPlayers: 2,
            matchID: matchID,
            game: GuessWho,
            multiplayer: SocketIO({ server: '192.168.1.29:8000' }),
            playerID: playerID,
            credentials: playerCredentials,
        });

        this.playersNames = playersNames;
        this.cardData = imagesList;
        this.canDrop = false;
        this.lastChecked = null;
        this.answer = false;
        this.answeredQuestions = [];
        this.turnNumber = { number: 0 };
        this.question = {
            atribute: "",
            operator: "",
            value: ""
        };

        this.yourCard = [];


        console.log("question is ", this.question)
        this.questionResponse;
        this.cardsToDrop = [];


        console.log("YOUR PLAYER ID IS", this.client.playerID);
        console.log("YOUR MATCH ID IS", this.client.matchID);

        this.client.start();
        this.opID = this.client.playerID == "0" ? "1" : "0";


        this.rootElement = rootElement.appElement;

        let boardHeads = this.rootElement.querySelectorAll(".boardHead")
        for (let i = 0; i < boardHeads.length; i++) {
            boardHeads[i].innerHTML = "Player " + (i == 1 ? playerID : this.opID) + " Board";
        }



        this.rootElement.querySelector("#left").innerHTML += "<h1>Guess Who</h1>";
        this.rootElement.querySelector("#left").innerHTML += "<h2 id='turn'>Player Turn: </h2>";

        this.createYourBoard(playerID, imagesList);
        this.createOpBoard();


        this.attachListeners();
        this.initializeChat();
        this.client.subscribe(state => {
            this.update(state)
            this.displayChatMessages(state);
            this.updatePlayerNames();
        });


    }

    async updatePlayerNames() {
        let temp = await lobbyClient.getMatch("guesswho", this.client.matchID);

        this.playersNames = temp.players;
        let player0 = this.playersNames[0].name == undefined ? "Player 1" : this.playersNames[0].name;
        let player1 = this.playersNames[1].name == undefined ? "Player 2" : this.playersNames[1].name;

        let isConected0 = this.playersNames[0].isConnected;
        if (isConected0 == false || isConected0 == undefined) {
            isConected0 = "rgb(255, 0, 0)";
        } else { isConected0 = "rgb(0, 255, 0)"; }

        let isConected1 = this.playersNames[1].isConnected;
        if (isConected1 == false || isConected1 == undefined) {
            isConected1 = "rgb(255, 0, 0)";
        } else { isConected1 = "rgb(0, 255, 0)"; }


        let playerListElement = document.getElementById("playerList");
        playerListElement.innerHTML = `<h2>Players</h2>
        <svg class="conectedCircle" height="100" width="100" xmlns="http://www.w3.org/2000/svg" style="background-color: ${isConected0};">
        <circle r="45" cx="50" cy="50" fill="red" />
      </svg>${player0}<br>
        <svg class="conectedCircle" height="100" width="100" xmlns="http://www.w3.org/2000/svg" style="background-color: ${isConected1};">
        <circle r="45" cx="50" cy="50" fill="red" />
      </svg>${player1}
        
        
        
        
        `;


    }



    // Method to display chat messages
    displayChatMessages(state) {

        const chatContainer = document.getElementById('chat-messages');
        chatContainer.innerHTML = ''; // Clear previous messages

        this.client.chatMessages.forEach(message => {
            // if (message.payload.includes("atrQuest")) {
            //     this.question = message.payload.split(" ")[1];
            // }
            const messageElement = document.createElement('div');
            //console.log(message)
            let playerName = this.playersNames[message.sender].name == undefined ? "No name" : this.playersNames[message.sender].name;
            messageElement.textContent = `${playerName}: ${message.payload}`;
            chatContainer.appendChild(messageElement);

            if ((this.answer && message.sender !== this.client.playerID) && !this.answeredQuestions.includes(message.id)) {
                let response = prompt(message.payload);
                this.answeredQuestions.push(message.id);
                this.client.moves.answerQuestion("res" + response, message.id, this.client.sendChatMessage);
            }

            if (message.payload.includes("res")) {
                this.client.chatMessages = [];
                let res = message.payload.split(" ");
                console.log(res);
                this.questionResponse = res;

                if (res.includes("yes")) {
                    console.log(this.question)
                } else if (res.includes("no")) {
                    this.question = {}
                }

                this.displayChatMessages()
                this.client.events.endStage();
                console.log(state.ctx.activePlayers)

            }

        });
    }

    // Method to initialize chat UI and event listeners
    initializeChat() {
        console.log("making chat")
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        sendButton.addEventListener('click', () => {
            const message = messageInput.value;
            let splitMsg = message.split(" ");

            messageInput.value = ''; // Clear input field after sending
            this.question = {
                atribute: splitMsg[0],
                operator: splitMsg[1],
                value: splitMsg[2]

            };
            console.log(this.question)
            this.client.moves.askQuestion(message, this.client.sendChatMessage);

        });



    }


    createYourBoard(tableNum, images) {
        let board = this.rootElement.querySelector("#playerBoard");
        const rows = [];
        console.log(board);


        for (let i = 0; i < 5; i++) {
            const cells = [];
            for (let j = 0; j < 6; j++) {
                const id = 6 * i + j;

                let temp = `<td class="cellWrapper" ><div class="cell"  data-id="${id}" data-tablenum="${tableNum}" style="background-image: url(${images[id].image.value})"></div></td>`
                cells.push(temp);


            }
            rows.push(`<tr>${cells.join('')}</tr>`);
        }
        board.innerHTML += `
      <table>${rows.join('')}</table>
      <p class="winner"></p>`;

    }

    createOpBoard() {
        let board = this.rootElement.querySelector("#opponentBoard");
        const rows = [];
        console.log(board);


        for (let i = 0; i < 5; i++) {
            const cells = [];
            for (let j = 0; j < 6; j++) {
                const id = 6 * i + j;

                let temp = `<td class="cellWrapper" ><div class="cell"  data-id="${id}" style="background-color: rgb(204,204,204)"></div></td>`
                cells.push(temp);


            }
            rows.push(`<tr>${cells.join('')}</tr>`);
        }
        board.innerHTML += `
      <table>${rows.join('')}</table>
      <p class="winner"></p>`;

    }





    attachListeners() {
        // This event handler will read the cell id from a cell’s
        // `data-id` attribute and make the `clickCell` move.
        const handleCellClick = event => {
            if (true) {
                let cellId = event.target.dataset.id;
                let tableNum = event.target.dataset.tablenum;
                let data = this.cardData[cellId];
                const dataSection = document.getElementById("dataSection");


                const nameEle = dataSection.querySelector("#name");
                const heightEle = dataSection.querySelector("#height");
                const dobEle = dataSection.querySelector("#dob");

                nameEle.innerHTML = (data.actorLabel == undefined ? "Unknown" : data.actorLabel.value);
                heightEle.innerHTML = (data.height == undefined ? "Unknown" : data.height.value + "m");
                dobEle.innerHTML = (data.date_of_birth == undefined ? "Unknown" : data.date_of_birth.value.split('-')[0]);



                if (this.lastChecked != event.target && this.lastChecked !== null) {
                    this.lastChecked.style.border = "";
                    event.target.style.border = "2px solid green";
                } else {
                    event.target.style.border = "2px solid green";
                }

                this.lastChecked = event.target;


            };
            if (this.canDrop == false) {
                return;
            }
            const id = parseInt(event.target.dataset.id);
            const tableNum = parseInt(event.target.dataset.tablenum);
            const playerTurn = this.client.getState().ctx.currentPlayer;
            console.log(playerTurn != tableNum)
            console.log(event.target.innerHTML == playerTurn);
            let passscore = 0;

            if (playerTurn != tableNum) {
                return
            }
            else { passscore++; }
            if (event.target.style.backgroundColor == "red") {
                this.client.moves.clickCell(id, tableNum, true);
            }
            else { passscore++; }
            console.log("your passscore is", passscore)
            if (passscore == 2) { this.client.moves.clickCell(id, tableNum, false); }

        };
        // Attach the event listener to each of the board cells.
        const cells = this.rootElement.querySelectorAll('#playerBoard');
        cells.forEach(cell => {
            cell.onclick = handleCellClick;
        });

        // Add event listener to the "Finish Turn" button
        const finishTurnButton = document.getElementById('finish-turn-button');
        finishTurnButton.addEventListener('click', () => {
            // Call the endTurn function when the button is clicked
            this.client.events.endTurn();
        });

        const makeGuessButton = document.getElementById('flip-button');
        makeGuessButton.style.color = this.canDrop == true ? "green" : "red";
        makeGuessButton.addEventListener('click', () => {
            console.log("guess");
            this.canDrop = (this.canDrop == false ? true : false);
            makeGuessButton.style.color = this.canDrop == true ? "green" : "red";
            console.log(this.canDrop);
        });

        const guessWhoButton = document.getElementById('guesswho-button');
        guessWhoButton.addEventListener('click', async () => {
            console.log("GUESSWHO");

            this.client.moves.guessWho();
            console.log
            if (this.client.getState().G.guess[this.client.playerID] == false) {
                console.log("this is happening")
                this.client.events.setStage('answerQuestionStage');
            } else {
                // this.client.events.endGame();
            }
            console.log(this.client.getState().ctx.activePlayers);
        });

        //leave game button 
        const leaveGameButton = document.getElementById('leave-game-button');
        leaveGameButton.addEventListener('click', async () => {
            await lobbyClient.leaveMatch('guesswho', this.client.matchID, {
                playerID: this.client.playerID,
                credentials: this.client.credentials,
            });
            window.location.href = "http://localhost:1234/lobby.html";
        });



    }




    update(state) {
        if (state === null) return;
        if (("gameover" in state.ctx)) {
            if (state.ctx.gameover.winner == this.client.playerID) {
                document.getElementById("guess").innerHTML = "<h1>You Win!</h1>";
                this.rootElement.innerHTML = ""
                let temp = document.createElement("button")
                temp.addEventListener('click', async () => {
                    await lobbyClient.leaveMatch('guesswho', this.client.matchID, {
                        playerID: this.client.playerID,
                        credentials: this.client.credentials,
                    });
                    window.location.href = "http://localhost:1234/lobby.html";
                });
                console.log(temp)
                this.rootElement.appendChild(temp)
                temp.innerHTML = "Leave Game";
            } else if (state.ctx.gameover.winner == this.opID) {
                document.getElementById("guess").innerHTML = "<h1>You Lose!</h1>";
                this.rootElement.innerHTML = ""
                let temp = document.createElement("button")
                temp.addEventListener('click', async () => {
                    await lobbyClient.leaveMatch('guesswho', this.client.matchID, {
                        playerID: this.client.playerID,
                        credentials: this.client.credentials,
                    });
                    window.location.href = "http://localhost:1234/lobby.html";
                });
                console.log(temp)
                this.rootElement.appendChild(temp)
                temp.innerHTML = "Leave Game";
            }
            return;
        }



        // Get all the board cells.
        let cells = document.getElementById("playerBoard").querySelectorAll(".cell");
        // Update cells to display the values in game state.
        cells.forEach(cell => {
            const cellId = parseInt(cell.dataset.id);
            const cellValue = state.G.boards[this.client.playerID == 0 ? "0" : "1"][cellId];
            if (cellValue !== null) {
                cell.style.backgroundImage = "";
                cell.style.backgroundColor = (cellValue !== null ? 'red' : "");
            } else {
                cell.style.backgroundImage = `url(${this.cardData[cellId].image.value})`;
                cell.style.backgroundColor = "";
            }
        });



        let opCells = document.getElementById("opponentBoard").querySelectorAll(".cell");
        opCells.forEach(cell => {
            const cellId = parseInt(cell.dataset.id);
            const cellValue = state.G.boards[this.client.playerID == 0 ? "1" : "0"][cellId];
            cell.style.backgroundColor = (cellValue == null ? 'rgb(204,204,204)' : 'red');
        });

        let currentPlayer = state.ctx.currentPlayer;
        currentPlayer === "0" ? this.rootElement.querySelector("#turn").textContent = "Player Turn: 0" : this.rootElement.querySelector("#turn").textContent = "Player Turn: 1";




        // Get the gameover message element.
        const messageEl = this.rootElement.querySelector('.winner');
        // Update the element to show a winner if any.
        if (state.ctx.gameover) {
            messageEl.textContent =
                state.ctx.gameover.winner !== undefined
                    ? 'Winner: ' + state.ctx.gameover.winner
                    : 'Draw!';
        } else {
            messageEl.textContent = '';
        }

        //update chat element to hide if not in askQuestionStage
        const chatElement = document.getElementById('questionBox');
        console.log(state.ctx.activePlayers)
        if (state.ctx.activePlayers[this.client.playerID] == "askQuestionStage") {
            if (state.ctx.activePlayers[this.opID] == "answerQuestionStage") {
                chatElement.style.display = "block";
            } else {
                chatElement.style.display = "none";
            }


        } else {
            chatElement.style.display = "none";
        }

        if (state.ctx.activePlayers[this.client.playerID] == "dropCardStage") {
            this.canDrop = true;

            cells.forEach(cell => {
                const cellId = parseInt(cell.dataset.id);
                const cellValue = state.G.boards[this.client.playerID == 0 ? "0" : "1"][cellId];


                let cellAtribute = this.cardData[cellId][this.question.atribute];
                let cellAtributeValue = cellAtribute == undefined ? "Unknown" : cellAtribute.value;

                let oporatorFunction = getOporatorFunction(this.question.operator);
                console.log(cellAtributeValue, this.question.value, oporatorFunction(cellAtributeValue, this.question.value))
                console.log(cellAtributeValue < this.question.value)

                if (oporatorFunction(cellAtributeValue, this.question.value)) {
                    cell.style.border = "2px solid yellow";
                    cell.style.setProperty('--background-color', 'rgba(0, 0, 255, 0.199)');


                } else {
                    cell.style.setProperty('--background-color', 'rgba(0, 0, 0, 0)');
                    cell.style.border = " ";
                }



            })


        } else {
            this.canDrop = false;
            cells.forEach(cell => {
                cell.style.setProperty('--background-color', 'rgba(0, 0, 0, 0)');
                cell.style.border = " ";
            })
        }

        if (state.ctx.activePlayers[this.client.playerID] == "answerQuestionStage") {
            this.answer = true;
        } else { this.answer = false; }


    }

}





async function getImages() {
    let imagesList;



    console.log("runnig")

    const endpointUrl = 'https://query.wikidata.org/sparql';
    const sparqlQuery = `SELECT ?actor ?actorLabel ?image ?height ?date_of_birth WHERE {
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
            ?actor wdt:P106 wd:Q33999.
            OPTIONAL { ?actor wdt:P18 ?image. }
            OPTIONAL { ?actor wdt:P2048 ?height. }
            OPTIONAL { ?actor wdt:P569 ?date_of_birth. }
        }
        LIMIT 60`;

    const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);

    try {
        const response = await queryDispatcher.query(sparqlQuery);
        if (response && response.results && response.results.bindings) {
            console.log(response.results.bindings)
            let imagesList = response.results.bindings.filter(item => "image" in item);
            console.log(imagesList);
            return imagesList;
        } else {
            console.error("Invalid response format:", response);
            return [];
        }
    } catch (error) {
        console.error("Error fetching images:", error);
        return [];
    }



    //console.log(imagesList);
    return imagesList;
}



async function startGame() {
    const playerCredentials = sessionStorage.getItem('playerCredentials');
    const playerName = sessionStorage.getItem('playerName');
    const playerId = sessionStorage.getItem('playerID');
    const matchId = sessionStorage.getItem('matchID');


    console.log("playerCredentials: ", playerCredentials);
    console.log("playerName: ", playerName);



    const imageList = await getImages()
    const appElement = document.getElementById('app');


    const playersList = (await lobbyClient.getMatch("guesswho", matchId)).players;
    const playersNames = {
        0: playersList[0].name,
        1: playersList[1].name
    }
    console.log("players: ", playersList);
    new GuessWhoClient({ appElement }, imageList, matchId, playersNames, playerCredentials, { playerID: playerId });


}






startGame();


function getOporatorFunction(oporator) {
    switch (oporator) {
        case "<":
            return (a, b) => a > b;
        case ">":
            return (a, b) => a < b;
        case "=":
            return (a, b) => a == b;
        default:
            return (a, b) => a == b;
    }
}
