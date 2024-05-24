export const GuessWho = {
    name: 'guesswho',
    setup: () => ({
        boards: {
            "0": Array(30).fill(null),
            "1": Array(30).fill(null)
        },
        selectedCells: { "0": [], "1": [] }
    }),

    moves: {
        clickCell: ({ G, playerID }, id, tableNum, undo) => {
            if (playerID != tableNum) {
                return;
            }
            console.log(playerID)
            if (undo == true) {
                G.boards[playerID][id] = null;
                console.log("undo")
            } else { G.boards[playerID][id] = playerID; }

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

