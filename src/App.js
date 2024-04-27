import { Client } from 'boardgame.io/client';
import { GuessWho } from './Game';

class GuessWhoClient {
    constructor(rootElement) {
        this.client = Client({ game: GuessWho });
        this.client.start();
        this.rootElement = rootElement;
        this.rootElement.innerHTML = "<h1>Guess Who</h1>";
        this.rootElement.innerHTML += "<h2 id='turn'>Player Turn: </h2>";
        this.createBoard(0);
        this.rootElement.innerHTML += "<br>"
        this.createBoard(1);
        this.attachListeners();
        this.client.subscribe(state => this.update(state));
    }

    createBoard(tableNum) {
        this.rootElement.innerHTML += `<h2>Table ${tableNum}</h2>`;
        const rows = [];
        const images = this.getImages();
        for (let i = 0; i < 5; i++) {
            const cells = [];
            for (let j = 0; j < 10; j++) {
                const id = 10 * i + j;
                cells.push(`<td  style="background-image: url(${images[id]})" class="cell" data-id="${id}" data-tablenum="${tableNum}"></td>`);
            }
            rows.push(`<tr>${cells.join('')}</tr>`);
        }

        this.rootElement.innerHTML += `
          <table>${rows.join('')}</table>
          <p class="winner"></p>
        `;
    }

    getImages() {
        const images = [];
        for (let i = 0; i < 50; i++) {
            images.push(`https://picsum.photos/50/50?random=${i}`);

        }





        return images;

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

            if (passscore == 2) { this.client.moves.clickCell(id, tableNum); }

        };
        // Attach the event listener to each of the board cells.
        const cells = this.rootElement.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.onclick = handleCellClick;
        });
    }




    update(state) {
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
const appElement = document.getElementById('app');
const app = new GuessWhoClient(appElement);





class SPARQLQueryDispatcher {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    query(sparqlQuery) {
        const fullUrl = this.endpoint + '?query=' + encodeURIComponent(sparqlQuery);
        const headers = { 'Accept': 'application/sparql-results+json' };

        return fetch(fullUrl, { headers }).then(body => body.json());
    }
}

const endpointUrl = 'https://query.wikidata.org/sparql';
const sparqlQuery = `SELECT ?actor ?actorLabel ?image WHERE {
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  ?actor wdt:P106 wd:Q33999.
  OPTIONAL { ?actor wdt:P18 ?image. }
}
LIMIT 50`;

const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
queryDispatcher.query(sparqlQuery).then(response => {
    const images = response.results;
    console.log(images);
})

