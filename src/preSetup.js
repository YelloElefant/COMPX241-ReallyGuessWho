import { SPARQLQueryDispatcher } from './SPARQLQueryDispatcher';

export const imagesList = getImages();

async function getImages() {
    let imagesList;



    console.log("runnig")

    const endpointUrl = 'https://query.wikidata.org/sparql';
    const sparqlQuery = `SELECT ?actorLabel ?image WHERE {
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      ?actor wdt:P106 wd:Q33999.
      OPTIONAL { ?actor wdt:P18 ?image. }
    }
    LIMIT 60`;

    const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
    await queryDispatcher.query(sparqlQuery).then(response => {
        imagesList = response.results.bindings;

        console.log(imagesList);


        for (let i = 0; i < imagesList.length; i++) {


            while (Object.values(imagesList[i]).length < 2) {
                console.log("Error " + [i] + ": No image found for " + imagesList[i].actorLabel.value);
                //imagesList[i] = { actorLabel: { value: imagesList[i].actorLabel.value }, image: { value: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNUsx1LY3dPUcMt02PYqC_VDJuHoxuRJYe7-CguhdPmA&s" } };
                imagesList.splice(i, 1);

            }



        }

        //console.log(images[1]);
        console.log("run")



    });

    console.log(imagesList);
    return imagesList;
}