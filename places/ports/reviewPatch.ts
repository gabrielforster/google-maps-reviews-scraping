import { createHash } from "node:crypto"

import { PrismaClient } from "@prisma/client";
import { PrismaReviewsRespository } from "../respositories/reviews/PrismaReviewsRepository";
import { Review } from "../../shared/types";

type ReviewPatchInput = Array<Review>;

export async function handler (reviews: ReviewPatchInput) {
  try {
    const prisma = new PrismaClient();
    const reviewsRepository = new PrismaReviewsRespository(prisma);

    const promises = reviews.map(async (review) => {
      const commentAndRating = `${review.comment}${review.rating}`;

      const commentHash = createHash('md5')
        .update(commentAndRating)
        .digest('hex');

        await reviewsRepository.upsert({
          ...review,
          commentHash
        });
    });

    prisma.$disconnect();

    const results = await Promise.allSettled(promises);

    const rejecteds = results.filter(result => result.status === 'rejected');

    if (rejecteds.length > 0) {
      console.error(rejecteds);
    }
  } catch (error) {
    console.error(error)
  }
}
