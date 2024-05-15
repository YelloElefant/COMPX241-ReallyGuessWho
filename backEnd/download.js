const https = require('https');
const http = require('http');
const fs = require('fs');
const { Server } = require('socket.io');
const SPARQLQueryDispatcher = require('./SPARQLQueryDispatcher.js');






let client = http;
let topicsJson = JSON.parse(fs.readFileSync('./data/topics.json', 'utf8'));

// create image directories for each topic
topicsJson.topics.forEach(topic => {
    let directoryPath = topic.imageDirPath;
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }
});



// function to download a specifc image from a url and save it to a filepath
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        if (url.toString().indexOf("https") === 0) {
            client = https;
        } else {
            client = http;
        }
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303 || res.statusCode === 307 || res.statusCode === 308) {
                //Recursively follow redirects, only a 200 status code will resolve.
                downloadImage(res.headers.location, filepath)
                    .then(resolve)
                    .catch(reject);
            }
            else {
                // Consume response data to free up memory
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));

            }
        });
    });
}

// function to get a list of images from a SPARQL endpoint
async function getImageList(topicObj) {

    console.log("Getting images for " + topicObj.name);

    let list
    const endpointUrl = topicsJson.SPARQL.url;
    const sparqlQuery = topicObj.querry;

    console.log("Querying " + endpointUrl + " with " + sparqlQuery)

    const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
    await queryDispatcher.query(sparqlQuery)
        .then(response => {
            list = response.results.bindings;



            for (let i = 0; i < list.length; i++) {


                while (Object.values(list[i]).length < 2) {

                    console.log("Error " + [i] + ": No image found for " + list[i].actorLabel.value + ", trying " + list[i + 1].actorLabel.value);
                    //list[i] = { actorLabel: { value: list[i].actorLabel.value }, image: { value: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNUsx1LY3dPUcMt02PYqC_VDJuHoxuRJYe7-CguhdPmA&s" } };
                    list.splice(i, 1);

                }



            }

            //console.log(list);
            list.forEach(element => {
                //console.log(element.image.value)
                let stringToSplit = element.image.value;
                let filepath = "./images/" + topicObj.name + "/" + stringToSplit.split('/')[5]
                //add filepath to element
                element.filepath = filepath;
            });
            //console.log(list.length)



        })
        .catch(
            console.error
        );
    return list;
}

//use Promis.all() to download all images

// function to download a list of images
async function downloadImages(imagesList) {
    let downloadedImages = 0;
    let failedImages = 0;
    let failedImagesList = [];

    for (const element of imagesList) {
        if (!checkForImage(element.filepath)) {
            console.log("Downloading " + element.filepath);
            console.log(element.image.value)
        }
        else {
            console.log("Image already exists: " + element.filepath);
        }
    }

    await Promise.all(imagesList.map(element =>
        downloadImage(element.image.value, element.filepath)
            .then(() => {
                downloadedImages++;
            })
            .catch((d) => {
                console.error(d);
                console.error("Error downloading image " + element.image.value);
                failedImages++;
                failedImagesList.push(element);
            })
    )).then(() => {
        console.log("Downloaded " + downloadedImages + " images");
        console.log("Failed to download " + failedImages + " images");
        console.log("Total images: " + imagesList.length)
        return { successCount: downloadedImages, errorCount: failedImages, total: imagesList.length, failedList: failedImagesList };
    }).catch(() => {
        console.error("Error downloading images");
    });

    return { successCount: downloadedImages, errorCount: failedImages, total: imagesList.length, failedList: failedImagesList };


}

// function to check if an image exists
function checkForImage(imagePath) {
    if (fs.existsSync(imagePath)) { return true; }
    return false;
}




let port = 3000


const server = http.createServer();

const io = new Server(server, {});





io.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});

// Add a connect listener
io.on('connection', (socket) => {

    console.log('Client connected.');

    //add private message lsitener
    socket.on('download', (imageUrl, topic) => {

        console.log("downloading ", imageUrl)
        socket.emit('recieved', imageUrl);

        let filePath = "./images/" + topic + "/" + imageUrl.split('/')[5];

        downloadImage(imageUrl, filePath)
            .then(() => {
                console.log;
                socket.emit('success', imageUrl, filePath);
            })
            .catch(() => {
                console.error
                socket.emit('error', imageUrl, filePath);
            });

    });

    socket.on('downloadTopic', async (topic) => {
        let topicObj = topicsJson.topics.find(element => element.name === topic);
        let imagesList = await getImageList(topicObj);
        let responseData;
        await downloadImages(imagesList).then(data => responseData = data).catch(console.error);
        //console.log(responseData);
        socket.emit('successTopic', topic, responseData);

    });




    // Disconnect listener
    socket.on('disconnect', function () {
        console.log('Client disconnected.');
    });


});






server.listen(port, () => {
    console.log('Server listening at port %d', port);
});