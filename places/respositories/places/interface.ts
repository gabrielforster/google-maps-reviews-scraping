import { Place, PlaceWithId } from "../../types/place";

export type GetPlaceInput = {
  id: string;
  slug: never
} | {
  id: never;
  slug: string;
}

export interface PlacesRepository {
  get(input: GetPlaceInput): Promise<PlaceWithId | null>;

  list(): Promise<PlaceWithId[] | null>;

  add(place: Place): Promise<PlaceWithId>;
}
