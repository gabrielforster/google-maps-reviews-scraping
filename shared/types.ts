export type Review = {
  placeId: string;
  rating: number;
  comment?: string | null;
  reviewer: string;
  link: string;
  dateTimestamp: number;
}

export type ReviewWithId = Review & {
  id: string;
}
