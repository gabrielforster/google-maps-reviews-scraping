import { PlacesRepository } from "../respositories/places/interface";
import { PlaceWithId } from "../types";

type Input = {
  data: {
    slug: string
  }
  placesRepository: PlacesRepository
}

export class GetPlace {
  private readonly slug: string
  private readonly placesRepository: PlacesRepository

  constructor({
    data: {
      slug
    },
    placesRepository,
  }: Input) {
    this.slug = slug
    this.placesRepository = placesRepository
  }

  async execute () {
    return this.get();
  }

  private async get (): Promise<PlaceWithId> {
    const place = await this.placesRepository.get({ slug: this.slug });

    if (place === null)
      throw new Error('not found');

    return place;
  }
}
