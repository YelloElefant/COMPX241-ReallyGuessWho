import { Client } from 'boardgame.io/client';
import { GuessWho } from './Game';
import { SPARQLQueryDispatcher } from './SPARQLQueryDispatcher';
import request from 'request';
import { SocketIO } from 'boardgame.io/multiplayer'


class GuessWhoClient {

    constructor(rootElement, imagesList, { playerID } = {}) {
        this.client = Client({
            game: GuessWho,
            multiplayer: SocketIO({ server: '192.168.1.29:8000' }),
            playerID,
        });

        console.log("YOUR PLAYER ID IS", playerID);

        this.client.start();
        this.rootElement = rootElement.appElement;

        console.log(this.rootElement)

        this.rootElement.innerHTML += "<h1>Guess Who</h1>";
        this.rootElement.innerHTML += "<h2 id='turn'>Player Turn: </h2>";

        this.createBoard(0, imagesList);
        this.rootElement.innerHTML += "<br>"
        this.createBoard(1, imagesList);

        this.attachListeners();
        this.client.subscribe(state => this.update(state));



    }





    createBoard(tableNum, images) {
        console.log('making' + tableNum)
        let board = this.rootElement.querySelector('#board' + tableNum);
        console.log(board)
        const rows = [];



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



    attachListeners() {
        // This event handler will read the cell id from a cell’s
        // `data-id` attribute and make the `clickCell` move.
        const handleCellClick = event => {
            const id = parseInt(event.target.dataset.id);
            const tableNum = parseInt(event.target.dataset.tablenum);
            const playerTurn = this.client.getState().ctx.currentPlayer;
            console.log(playerTurn != tableNum)
            console.log(event.target.innerHTML == playerTurn);
            let passscore = 0;

            if (playerTurn != tableNum) {
                alert("Wrong Board!");
                return
            }
            else { passscore++; }
            if (event.target.innerHTML == playerTurn) {
                alert("Already clicked!");
                return
            }
            else { passscore++; }
            console.log("your passscore is", passscore)
            if (passscore == 2) { this.client.moves.clickCell(id, tableNum); }

        };
        // Attach the event listener to each of the board cells.
        const cells = this.rootElement.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.onclick = handleCellClick;
        });
    }




    update(state) {
        if (state === null) return;
        // Get all the board cells.
        let cells = this.rootElement.querySelectorAll("[data-tablenum='0']");
        // Update cells to display the values in game state.
        cells.forEach(cell => {
            const cellId = parseInt(cell.dataset.id);
            const cellValue = state.G.cells0[cellId];
            cell.textContent = cellValue !== null ? cellValue : '';
        });

        cells = this.rootElement.querySelectorAll("[data-tablenum='1']");
        cells.forEach(cell => {
            const cellId = parseInt(cell.dataset.id);
            const cellValue = state.G.cells1[cellId];
            cell.textContent = cellValue !== null ? cellValue : '';
        });

        let currentPlayer = state.ctx.currentPlayer;
        currentPlayer === "0" ? this.rootElement.querySelector("#turn").textContent = "Player Turn: 0" : this.rootElement.querySelector("#turn").textContent = "Player Turn: 1";




        // Get the gameover message element.
        const messageEl = this.rootElement.querySelector('.winner');
        console.log("messageEl is", messageEl)
        // Update the element to show a winner if any.
        if (state.ctx.gameover) {
            messageEl.textContent =
                state.ctx.gameover.winner !== undefined
                    ? 'Winner: ' + state.ctx.gameover.winner
                    : 'Draw!';
        } else {
            messageEl.textContent = '';
        }
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
    await queryDispatcher.query(sparqlQuery).then(response => {
        imagesList = response.results.bindings;

        console.log(imagesList);


        for (let i = 0; i < imagesList.length; i++) {


            while (!("image" in imagesList[i])) {

                console.log("Error " + [i] + ": No image found for " + imagesList[i].actorLabel.value);
                //imagesList[i] = { actorLabel: { value: imagesList[i].actorLabel.value }, image: { value: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNUsx1LY3dPUcMt02PYqC_VDJuHoxuRJYe7-CguhdPmA&s" } };
                imagesList.splice(i, 1);

            }



        }

        console.log(imagesList);
        console.log("run")



    });

    //console.log(imagesList);
    return imagesList;
}

import { LobbyClient } from 'boardgame.io/client';



async function startGame() {
    const lobbyClient = new LobbyClient({ server: 'http://localhost:8081' });

    const games = await lobbyClient.listGames()
        .then(console.log) // => ['chess', 'tic-tac-toe']
        .catch(console.error);

    const imageList = await getImages()
    const appElement = document.getElementById('app');
    let id = prompt("Enter your player ID: ");




    new GuessWhoClient({ appElement }, imageList, { playerID: id });


}





startGame();


