import { PrismaClient } from "@prisma/client";

import { Place, PlaceWithId } from "../../types/place";
import { GetPlaceInput, PlacesRepository } from "./interface";

export class PrismaPlacesRespository implements PlacesRepository {
  constructor(private readonly prisma: PrismaClient) { }

  get({ id, slug }: GetPlaceInput): Promise<PlaceWithId | null> {
    throw new Error("Method not implemented.");
  }
  
  async list () {
    const places = await this.prisma.place.findMany();

    return places.map(place => ({
      id: place.id,
      name: place.name,
      slug: place.slug,
      description: place.description,
      url: place.url,
      createdAt: place.createdAt
    }));
  }

  async add(place: Place): Promise<PlaceWithId> {
    const saved = await this.prisma.place.create({
      data: {
        name: place.name,
        slug: place.slug,
        description: place.description,
        url: place.url
      }
    })

    return {
      id: saved.id,
      name: saved.name,
      slug: saved.slug,
      description: saved.description,
      url: saved.url,
      createdAt: saved.createdAt
    }
  }
}
