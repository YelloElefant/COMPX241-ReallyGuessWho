import fetch, { fileFrom } from "node-fetch";

class SPARQLQueryDispatcher {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    query(sparqlQuery) {
        const fullUrl = this.endpoint + '?query=' + encodeURIComponent(sparqlQuery);
        const headers = { 'Accept': 'application/sparql-results+json' };

        return fetch(fullUrl, { headers }).then(body => body.json());
    }
}


function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                // Consume response data to free up memory
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));

            }
        });
    });
}

async function test() {


    const endpointUrl = 'https://query.wikidata.org/sparql';
    const sparqlQuery = `SELECT ?actorLabel ?image WHERE {
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      ?actor wdt:P106 wd:Q33999.
      OPTIONAL { ?actor wdt:P18 ?image. }
    }
    LIMIT 60`;

    const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
    await queryDispatcher.query(sparqlQuery).then(response => {
        let imagesList = response.results.bindings;



        for (let i = 0; i < imagesList.length; i++) {


            while (Object.values(imagesList[i]).length < 2) {

                console.log("Error " + [i] + ": No image found for " + imagesList[i].actorLabel.value);
                //imagesList[i] = { actorLabel: { value: imagesList[i].actorLabel.value }, image: { value: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNUsx1LY3dPUcMt02PYqC_VDJuHoxuRJYe7-CguhdPmA&s" } };
                imagesList.splice(i, 1);

            }



        }

        console.log(imagesList);
        imagesList.forEach(element => {
            //console.log(element.image.value)
            let filepath = "../images/" + element.image.value.split('/')[5]

            downloadImage(imagesList.image.value, filepath)
        });
        console.log(imagesList.length)



    })
        .catch(
            console.error
        );
}

test();

//downloadImage('', '../images/lena.png')
//    .then(console.log)
//    .catch(console.error);

