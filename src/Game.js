export const GuessWho = {
    name: 'guesswho',
    setup: () => ({
        boards: {
            "0": Array(30).fill(null),
            "1": Array(30).fill(null)
        }
    }),

    moves: {
        clickCell: ({ G, playerID }, id, tableNum) => {
            if (playerID != tableNum) {
                return;
            }
            console.log(playerID)
            G.boards[playerID][id] = playerID;

        },
    },
    turn: {
        maxMoves: 1,
        minMoves: 1,
    },
};

