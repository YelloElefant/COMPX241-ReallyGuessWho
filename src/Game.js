export const GuessWho = {
    name: 'guesswho',
    setup: () => ({
        boards: {
            "0": Array(30).fill(null),
            "1": Array(30).fill(null)
        },
        selectedCells: { "0": [], "1": [] }
    }),



    turn: {
        onBegin: ({ G, events, playerID }) => {
            console.log("Turn begins for ", playerID)
            events.setActivePlayers({ currentPlayer: 'askQuestionStage' })
        },
        onEnd: ({ G, ctx, playerID }) => {
            console.log("Turn ends for ", playerID)
        },
        activePlayers: {
            currentPlayer: "askQuestionStage",
            others: "answerQuestionStage",
        },


        stages: {
            askQuestionStage: {
                moves: {
                    askQuestion,
                }

            },

            dropCardStage: {
                moves: {
                    dropCard,
                },
            },

            answerQuestionStage: {
                moves: {
                    answerQuestion,
                },
            },
        },
    },
};

function askQuestion({ G, ctx, playerID }, message) {
    console.log(ctx)

    console.log(playerID, "asked a question: ", message)


}

function clickCell({ G, playerID }, id, tableNum, undo) {
    if (playerID != tableNum) {
        return;
    }
    console.log(playerID)
    if (undo == true) {
        G.boards[playerID][id] = null;
    } else { G.boards[playerID][id] = playerID; }

}

function dropCard({ G, playerID }) {
    console.log(playerID, "dropped a card")
}

function answerQuestion({ G, playerID }) {
    console.log(playerID, "answered a question")
}

