import { PrismaClient } from "@prisma/client";
import { ReviewsRepository } from "./interface";
import { ReviewWithId, Review } from "../../../shared/types";

export class PrismaReviewsRespository implements ReviewsRepository {
  constructor(private readonly prisma: PrismaClient) { }

  async get(id: string): Promise<ReviewWithId | null> {
    const review = await this.prisma.review.findUnique({
      where: {
        id: id
      }
    })

    if (review === null)
      return null;

    return {
      id: review.id,
      placeId: review.placeId,
      comment: review.comment,
      rating: review.rating,
      reviewer: review.reviewerName,
      link: review.link,
      dateTimestamp: new Date(review.date).getTime(),
    }
  }

  async upsert(review: Review & { commentHash: string }): Promise<ReviewWithId> {
    try {
      const saved = await this.prisma.review.upsert({
        where: {
          placeId_rating_commentHash: {
            placeId: review.placeId,
            rating: review.rating,
            commentHash: review.commentHash
          }
        },
        update: {
          placeId: review.placeId,
          comment: review.comment,
          rating: review.rating,
          reviewerName: review.reviewer,
          link: review.link,
          date: new Date(review.dateTimestamp)
        },
        create: {
          placeId: review.placeId,
          comment: review.comment,
          rating: review.rating,
          reviewerName: review.reviewer,
          link: review.link,
          date: new Date(review.dateTimestamp),
          commentHash: review.commentHash,
        }
      })

      return {
        id: saved.id,
        placeId: saved.placeId,
        comment: saved.comment,
        rating: saved.rating,
        reviewer: saved.reviewerName,
        link: saved.link,
        dateTimestamp: new Date(saved.date).getTime(),
      }
    } catch (error) {
      console.error(error)
      throw new Error('error upserting review');
    }
  }
}
