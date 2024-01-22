/*
  Warnings:

  - A unique constraint covering the columns `[placeId,reviewer_name,rating,comment_hash]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "reviews_placeId_rating_comment_hash_key";

-- CreateIndex
CREATE UNIQUE INDEX "reviews_placeId_reviewer_name_rating_comment_hash_key" ON "reviews"("placeId", "reviewer_name", "rating", "comment_hash");
