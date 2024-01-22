import { Review } from "../../shared/types";

type Data = Array<any>;

export function parseGoogleResponse(dataToBeTransformed: Data, placeId: string): Array<Review> {
  return dataToBeTransformed.reduce((acc: Array<Review>, data) => {
      data.forEach(item => {
        if (Array.isArray(item)) {
          item.forEach(r => {
            const comment = r?.[0]?.[2]?.[1]?.[0];
            const rating = r?.[0]?.[2]?.[0]?.[0];
            const reviewer = r?.[0]?.[1]?.[4]?.[0]?.[4];
            const link = r?.[0]?.[4]?.[3]?.[0];
            const dateTimestamp = Number(String(r?.[0]?.[1]?.[2]).slice(0, -3));

            acc.push({
              placeId,
              comment,
              rating,
              reviewer,
              link,
              dateTimestamp,
            });
          });
        };
      });

    return acc;
  }, [] as Array<Review>);
};
