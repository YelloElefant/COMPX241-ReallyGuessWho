export const GuessWho = {
    setup: () => ({ cells0: Array(30).fill(null), cells1: Array(30).fill(null) }),

    moves: {
        clickCell: ({ G, playerID }, id, tableNum) => {
            if (playerID != tableNum) {
                return;
            }
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
        maxMoves: 1,
        minMoves: 1,
    },
};