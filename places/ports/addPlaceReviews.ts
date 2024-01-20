import { Context } from "aws-lambda";

type ReviewData = {}

type Event = {
  data: {
    placeId: string;
    reviews: Array<ReviewData>;
  }
}

export async function handler (event: Event) {
}
