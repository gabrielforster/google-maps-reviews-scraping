type Data = Array<any>;

export function parseGoogleResponse(dataToBeTransformed: Data) {
  return dataToBeTransformed.reduce((acc, data) => {
      data.forEach(item => {
        if (Array.isArray(item)) {
          item.forEach(r => {
            const comment = r?.[0]?.[2]?.[1]?.[0];
            const review = r?.[0]?.[2]?.[0]?.[0];
            const reviewer = r?.[0]?.[1]?.[4]?.[0]?.[4];
            const link = r?.[0]?.[4]?.[3]?.[0];
            const dateTimestamp = Number(String(r?.[0]?.[1]?.[2]).slice(0, -3));

            acc.push({
              comment,
              review,
              reviewer,
              link,
              dateTimestamp,
            });
          });
        };
      });

    return acc;
  }, []);
};
