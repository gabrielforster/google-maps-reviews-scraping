import { PlacesRepository } from "../respositories/places/interface";
import { PlaceWithId } from "../types";

type InputParams = {
  reviews: boolean;
}

export class ListPlaces {
  constructor(
    private readonly params: InputParams,
    private readonly placesRepository: PlacesRepository
  ) { }

  async execute() {
    return this.list();
  }

  private async list (): Promise<PlaceWithId[]> {
    const places = await this.placesRepository.list({
      returnReviews: this.params.reviews
    });

    if (places === null) {
      return [];
    }

    return places;
  }
}
