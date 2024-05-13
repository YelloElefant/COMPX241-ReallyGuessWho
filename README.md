# Really Guess Who Mock Up 
## COMPX241-group-project
---
Project for a Guess Who game using Node, boardgame.io, with docker as a deployment \
Node uses the following packages
* `boardgame.io@0.50.2`
* `parcel-bundler@1.12.5`
* `request@2.88.2`
* `socket.io@4.7.5`
---
Current working progress is for 1 client, it gets 50 random photos from `https://picsum.photos/50/50` and fills the 50 cells on the board with the photos. \
1 turn per playerr, each player picks a cell on there board and it adds there player id on that cell. \
need to add
* better image gathering
* multipler support
* sequrity for things each player shouldnt see
* pre game setup
* full move list for each player
---
### Topics.json
`/data/topics.json` is the file that contains all the topics that can be played. it contains 2 properties,
* `topics` -> this is an array that contains each topic defined
* `SPARQL` -> constant that holds infomation for the SPARQL API

each topic is defined like...
* `name` -> name for the topic
* `querry` -> the SPARQL querry that is to be run to gether the infomation for this topic
* `imageDirPath` -> ralitive folder path which holds the images to use for the specific topic
