import { Context } from "aws-lambda";
import https from "node:https";

type Event = {
 data: Array<{
  url: string;
  headers: {
    [key: string]: string;
  }
 }>
}

type Data = Array<any>

export async function handler (event: Event) {
  const { data } = event;

  const promises: Array<Promise<Data>> = data.map(async (item) => {
    const { url, headers } = item;

    return new Promise((resolve, reject) => {
      const request = https.request(url, {
        method: "GET",
        headers
      });

      request.on("response", (response) => {
        const chunks: Array<any> = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          const body = Buffer.concat(chunks).toString();

          resolve(JSON.parse(body));
        });
      });

      request.on("error", (err) => {
        reject(err);
      });
    })
  });

  const results = await Promise.allSettled(promises);

  const [fulfilled, rejected] = results.reduce((acc, result) => {
    if (result.status === "fulfilled") {
      acc[0].push(result.value);
    } else {
      acc[1].push(result.reason);
    }

    return acc;
  } , [[], []] as [Data, Array<Error>]);

  console.log("fulfilled", fulfilled);
  console.log("rejected", rejected);
}

