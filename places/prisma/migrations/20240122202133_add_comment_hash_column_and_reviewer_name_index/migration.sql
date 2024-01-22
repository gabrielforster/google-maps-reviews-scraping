/*
  Warnings:

  - A unique constraint covering the columns `[placeId,comment_hash]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `comment_hash` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "comment_hash" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "reviewer_name" ON "reviews"("placeId", "reviewer_name");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_placeId_comment_hash_key" ON "reviews"("placeId", "comment_hash");
