import { Client } from 'boardgame.io/client';
import { GuessWho } from './Game';

class GuessWhoClient {
    constructor(rootElement) {
        this.client = Client({ game: GuessWho });
        this.client.start();
        this.rootElement = rootElement;
        this.createBoard(0);
        this.rootElement.innerHTML += "<br>"
        this.createBoard(1);
        this.attachListeners();
        this.client.subscribe(state => this.update(state));
    }

    createBoard(tableNum) {
        const rows = [];
        for (let i = 0; i < 5; i++) {
            const cells = [];
            for (let j = 0; j < 10; j++) {
                const id = 10 * i + j;
                cells.push(`<td class="cell" data-id="${id}" data-tablenum="${tableNum}"></td>`);
            }
            rows.push(`<tr>${cells.join('')}</tr>`);
        }

        this.rootElement.innerHTML += `
          <table>${rows.join('')}</table>
          <p class="winner"></p>
        `;
    }

    attachListeners() {
        // This event handler will read the cell id from a cell’s
        // `data-id` attribute and make the `clickCell` move.
        const handleCellClick = event => {
            const id = parseInt(event.target.dataset.id);
            const tableNum = parseInt(event.target.dataset.tablenum);
            this.client.moves.clickCell(id, tableNum);
            console.log(event.target.dataset);
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
