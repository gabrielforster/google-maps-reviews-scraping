import { Prisma } from "@prisma/client";
import { PlacesRepository } from "../respositories/places/interface";
import { PlaceWithId } from "../types";

type Input = {
    data: {
      name: string,
      description: string,
      url: string
    },
    placesRepository: PlacesRepository
  }

export class CreatePlace {
  private readonly name: string;
  private readonly description: string;
  private readonly url: string;
  private slug: string;

  private readonly placesRepository: PlacesRepository;

  private originalSlug: string | null = null;
  private saveErrorCount = 0;

  constructor({
    data: {
      name,
      description,
      url
    },
    placesRepository
  }: Input) {
    this.name = name;
    this.description = description;
    this.url = url;
    this.slug = name.toLowerCase().split(" ").join("-")

    this.placesRepository = placesRepository;
  }

  async execute() {
    this.validate();

    const place = await this.save();

    return place;
  }

  private async save (): Promise<PlaceWithId> {
    try {
      const place = await this.placesRepository.add({
        name: this.name,
        slug: this.slug,
        description: this.description,
        url: this.url
      });

      return place;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message !== "Unique constraint validation failed") {
          console.info('There is a unique constraint violation, a new user cannot be created with this email')

          if (this.originalSlug === null) {
            this.originalSlug = this.slug;
          }

          this.saveErrorCount += 1;
          this.slug = `${this.originalSlug}-${this.saveErrorCount}`;

          return await this.save();
        }
      }

      throw error;
    }
  }

  private validate () {
    if (typeof this.name !== "string") {
      throw new Error("name is required as string");
    }

    if (typeof this.description !== "string") {
      throw new Error("description is required as string");
    }

    const url = new URL(this.url);
    if (!url.hostname) {
      throw new Error("invalid url");
    }

    if (!url.protocol) {
      throw new Error("invalid url");
    }

    if (!url.pathname) {
      throw new Error("invalid url");
    }

    if (!url.toString().includes("google.com/maps/place")) {
      throw new Error("invalid url");
    }
 }
}
