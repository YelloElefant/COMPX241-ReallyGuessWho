import fs from 'fs';


var topicsJson = JSON.parse(fs.readFileSync('../data/topics.json', 'utf8'));

topicsJson.topics.forEach(topic => {
    console.log(topic.name, topic.querry);

});
