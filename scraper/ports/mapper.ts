import { fetch } from "../lib/fetch";
import { parseGoogleResponse } from "../lib/parser";

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
  const { data } = event;

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

  const reviews = parseGoogleResponse(fulfilled);

  console.log(JSON.stringify(reviews, null, 2));
}

