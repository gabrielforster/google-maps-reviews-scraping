import { Lambda } from "@aws-sdk/client-lambda";
import { fetch } from "../lib/fetch";
import { parseGoogleResponse } from "../lib/parser";

const lambda = new Lambda({
  ...(
    process.env.IS_OFFLINE
      ? { region: 'localhost', endpoint: `http://localhost:${process.env.placesPort}` }
      : {}
  ),
})

type Event = {
  placeId: string;
  data: Array<{
    url: string;
    headers: {
      [key: string]: string;
    }
  }>
}

type Data = Array<any>;

export async function handler (event: Event) {
  const { data, placeId } = event;

  const promises = data.map(({ url, headers }) => fetch(url, headers));

  const results = await Promise.allSettled(promises);

  const [fulfilled, rejected] = results.reduce((acc, result) => {
    if (result.status === "fulfilled") {
      acc[0].push(result.value);
    } else {
      acc[1].push(result.reason);
    }

    return acc;
  } , [[], []] as [Data, Array<Error>]);

  if (rejected.length) {
    console.info("Rejecteds")
    rejected.forEach((error) => console.error(error));
  }

  const reviews = parseGoogleResponse(fulfilled, placeId);

  await lambda.invoke({
    FunctionName: 'places-api-reviewPatch',
    InvocationType: 'Event',
    Payload: JSON.stringify(reviews),
  });
}

