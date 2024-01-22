import { Review, ReviewWithId } from "../../../shared/types";

export interface ReviewsRepository {
  get(id: string): Promise<ReviewWithId | null>;

  upsert(place: Review): Promise<ReviewWithId>;
}
