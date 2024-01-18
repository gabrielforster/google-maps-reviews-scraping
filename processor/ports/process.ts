import { Context } from 'aws-lambda';

type Event = {
 data: Array<{
  url: string;
  headers: {
    [key: string]: string;
  }
 }>
}

export async function handler (event: Event, context: Context) {
  console.log("context", context);
  console.log("event", JSON.stringify(event, null, 2));
}
