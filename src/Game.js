export const GuessWho = {
    name: 'guesswho',
    setup: () => ({ 
        cells0: Array(30).fill(null), 
        cells1: Array(30).fill(null),
        selectedCells: { "0": [], "1": [] }
    }),

    moves: {
        clickCell: ({ G, playerID }, id, tableNum) => {
            if (playerID != tableNum) {
                return;
            }
            console.log(playerID)
            switch (playerID) {
                case "0":
                    G.cells0[id] = playerID;
                    break;
                case "1":
                    G.cells1[id] = playerID;
                    break;
            }

        },
    },
    turn: {
        maxMoves: 30,
        minMoves: 1,
    },
};

function askQuestion() {
    let question = prompt("Ask a question about the character you have in mind. (e.g. Is your character")
    console.log(question)


}

