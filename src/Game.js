export const GuessWho = {
    name: 'guesswho',
    setup: () => ({
        boards: {
            "0": Array(30).fill(null),
            "1": Array(30).fill(null)
        },
        selectedCells: {
            "0": [],
            "1": []
        },
        guess: {
            "0": false,
            "1": false
        }
    }),

    endIf: ({ G, ctx, events }) => {
        console.log("Checking for end")

        if (G.guess["0"]) {
            return { winner: "0" }
        } else if (G.guess["1"]) {
            return { winner: "1" }
        }


    },




    turn: {
        onBegin: ({ G, events, playerID }) => {
            console.log("Turn begins for ", playerID)
            events.setActivePlayers({
                currentPlayer: 'askQuestionStage',
                others: 'answerQuestionStage'
            })
        },
        onEnd: ({ G, ctx, playerID }) => {
            console.log("Turn ends for ", playerID)
        },
        activePlayers: {
            currentPlayer: "askQuestionStage",
            others: "answerQuestionStage",
        },
        maxMoves: 30,
        minMoves: 1,
        stages: {


            askQuestionStage: {
                moves: {
                    askQuestion,
                    guessWho,
                },
                next: 'dropCardStage',

            },

            dropCardStage: {
                moves: {
                    clickCell,
                },
                next: 'answerQuestionStage',
            },

            answerQuestionStage: {
                moves: {
                    answerQuestion,
                },
                next: 'askQuestionStage',
            },
        },
    },
};

function askQuestion({ G, ctx, playerID, events }, message, sendChatMessage) {
    sendChatMessage("atrQuest" + message)
    console.log(playerID, "asked a question: ", message)
    events.setStage("dropCardStage");

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

function answerQuestion({ G, playerID }, response, messageID, sendChatMessage) {
    console.log(playerID, "answered a question")
    sendChatMessage(response)

}



function guessWho({ G, events, playerID }) {
    console.log(playerID, "made a guess")
    let guess;
    try {
        guess = prompt("Make a guess")

    } catch (error) {
        console.log("Error in guessWho")
    }
    console.log(guess)
    G.guess[playerID] = true;
}


