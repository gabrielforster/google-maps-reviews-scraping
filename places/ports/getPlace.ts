import { APIGatewayProxyEvent, ProxyResult } from "aws-lambda";
import { lambdaResponse, lambdaError, checkParams } from "../././../shared/utils";
import { PrismaPlacesRespository } from "../respositories/places/PrismaPlacesRespository";
import { PrismaClient } from "@prisma/client";
import { GetPlace } from "../use_cases/GetPlace";

export async function handler (event: APIGatewayProxyEvent): Promise<ProxyResult> {
  try {
    const params = lambdaGetParams(event);

    const errors = checkParams(params, ['slug']);
    if (errors.length > 0) {
      const message = `Missing required fields: ${errors.join(', ')}`
      return lambdaError(400, message);
    }

    const prisma = new PrismaClient();
    const placesRepository = new PrismaPlacesRespository(prisma);

    const place = await new GetPlace({
      data: {
        slug: params.slug!
      },
      placesRepository
    }).execute();

    await prisma.$disconnect();

    return lambdaResponse(200, {
      body: place,
    })
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message === "not found") {
        return lambdaError(404, "Not Found");
      }

      return lambdaError(500, error.message);
    }

    return lambdaError(500, "Internal Server Error");
  }
}
function lambdaGetParams(event: APIGatewayProxyEvent) {
  return {
    slug: event.pathParameters?.slug,
  }
}

