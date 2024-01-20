export type Place = { 
  name: string;
  description?: string | null;
  slug: string;
  url: string;
  createdAt?: Date | null;
}

export type PlaceWithId = Place & {
  id: string;

}

