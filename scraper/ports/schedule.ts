import { Lambda } from '@aws-sdk/client-lambda';

const lambdaPlaces = new Lambda({
  ...(
    process.env.IS_OFFLINE
      ? { region: 'localhost', endpoint: `http://localhost:${process.env.placesPort}` }
      : {}
  ),
})

const lambdaScraper = new Lambda({
  ...(
    process.env.IS_OFFLINE
      ? { region: 'localhost', endpoint: `http://localhost:${process.env.scraperPort}` }
      : {}
  ),
})

export async function run () {
  try {
    const { Payload } = await lambdaPlaces.invoke({
      FunctionName: 'places-api-listPlaces',
      InvocationType: 'RequestResponse',
    });

    const string = new TextDecoder().decode(Payload);

    const json = JSON.parse(string || "{}") as { body: string };

    const places = JSON.parse(json.body ?? "[]");

    await Promise.all(places.map(async (place: any) => {
      await lambdaScraper.invoke({
        FunctionName: 'scraper-api-processor',
        InvocationType: 'Event',
        Payload: JSON.stringify({
          url: place.url,
          placeId: place.id,
        }),
      });
    }));
  } catch (error) {
    console.error(error);
  }
}
