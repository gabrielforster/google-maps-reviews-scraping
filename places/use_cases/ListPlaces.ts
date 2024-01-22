import { PlacesRepository } from "../respositories/places/interface";
import { PlaceWithId } from "../types";

export class ListPlaces {
  constructor(private readonly placesRepository: PlacesRepository) { 
  }

  async execute() {
    return this.list();
  }

  private async list (): Promise<PlaceWithId[]> {
    const places = await this.placesRepository.list();

    if (places === null) {
      return [];
    }

    return places;
  }
}
