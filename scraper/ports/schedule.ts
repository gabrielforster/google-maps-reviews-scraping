import { Lambda } from "aws-sdk";

const lambdaPlaces = new Lambda({
  ...(
    process.env.IS_OFFLINE
      ? { region: 'localhost', endpoint: `http://localhost:${process.env.placesPort}` }
      : {}
  )
})

const lambdaScraper = new Lambda({
  ...(
    process.env.IS_OFFLINE
      ? { region: 'localhost', endpoint: `http://localhost:${process.env.scraperPort}` }
      : {}
  )
})

export async function run () {
  try {
    const { Payload } = await lambdaPlaces.invoke({
      FunctionName: 'places-api-listPlaces',
      InvocationType: 'RequestResponse',
    }).promise();

    const json = JSON.parse(Payload?.toString() || "{}") as { body: string };

    const places = JSON.parse(json.body ?? "[]");

    await Promise.all(places.map(async (place: any, index: number) => {
      await lambdaScraper.invoke({
        FunctionName: 'scraper-api-processor',
        InvocationType: 'Event',
        Payload: JSON.stringify({ 
          url: place.url,
          placeId: place.id,
        }),
      }).promise();
    }));
  } catch (error) {
    console.error(error);
  }
}
