import { ReviewWithId } from "../../shared/types";

export type Place = {
  name: string;
  description?: string | null;
  slug: string;
  url: string;
  createdAt?: Date | null;
  reviews?: Omit<ReviewWithId, 'placeId'>[] | null;
}

export type PlaceWithId = Place & {
  id: string;
}

