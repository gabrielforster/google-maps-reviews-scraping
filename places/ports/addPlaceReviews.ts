import { Review } from "../../shared/types"

type Event = {
  data: {
    placeId: string;
    reviews: Array<Review>;
  }
}

export async function handler (event: Event) {
}
