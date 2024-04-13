export const GuessWho = {
    setup: () => ({ cells: Array(10).fill(null) }),

    moves: {
        clickCell: ({ G, playerID }, id) => {
            G.cells[id] = playerID;
        },
    },
};