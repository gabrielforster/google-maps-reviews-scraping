import https from "node:https";

export async function fetch (url: string, headers: { [key: string]: string }) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, {
      method: "GET",
      headers
    });

    request.on("response", (response) => {
      let data = Buffer.from([]);

      response.on("data", (chunk: Buffer) => {
        data = Buffer.concat([data, chunk]);
      });

      response.on("end", () => {
        const body = data.toString().slice(4);
        resolve(JSON.parse(body));
      });

      response.on("error", (error) => {
        reject(error);
      });
    });

    request.on("error", (error) => {
      reject(error);
    });

    request.end();
  })
}
