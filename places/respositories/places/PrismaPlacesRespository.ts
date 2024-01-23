import { Prisma, PrismaClient } from "@prisma/client";

import { Place, PlaceWithId } from "../../types/place";
import { GetPlaceInput, ListPlacesInput, PlacesRepository } from "./interface";

export class PrismaPlacesRespository implements PlacesRepository {
  constructor(private readonly prisma: PrismaClient) { }

  async get({ id, slug }: GetPlaceInput): Promise<PlaceWithId & { avarageRating: string } | null> {
    const place = await this.prisma.place.findUnique({
      where: {
        id: id,
        slug: slug
      },
      include: {
        reviews: true
      }
    })

    const avarageRating =
      (place?.reviews?.reduce((acc, review) => acc + review.rating, 0) ?? 0)
      / (place?.reviews?.length ?? 1);

    if (place === null)
      return null;

    return {
      id: place.id,
      name: place.name,
      slug: place.slug,
      description: place.description,
      url: place.url,
      createdAt: place.createdAt,
      avarageRating: avarageRating.toFixed(1),
      reviews: place.reviews?.map(review => ({
        id: review.id,
        placeId: review.placeId,
        comment: review.comment,
        rating: review.rating,
        reviewer: review.reviewerName,
        link: review.link,
        dateTimestamp: new Date(review.date).getTime(),
      }))
    }
  }

  async list ({ returnReviews }: ListPlacesInput): Promise<PlaceWithId[] | null> {
    const places = await this.prisma.place.findMany({
      include: {
        reviews: returnReviews
      }
    });

    return places.map(place => ({
      id: place.id,
      name: place.name,
      slug: place.slug,
      description: place.description,
      url: place.url,
      createdAt: place.createdAt,
      reviews: place.reviews?.map(review => ({
        id: review.id,
        placeId: review.placeId,
        comment: review.comment,
        rating: review.rating,
        reviewer: review.reviewerName,
        link: review.link,
        dateTimestamp: new Date(review.date).getTime(),
      }))
    }));
  }

  async add(place: Place): Promise<PlaceWithId> {
    try {
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error("Unique constraint validation failed")
        }
      }

      throw error;
    }
  }
}
