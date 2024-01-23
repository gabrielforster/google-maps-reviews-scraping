import { APIGatewayProxyEvent, ProxyResult } from "aws-lambda";
import { lambdaResponse, lambdaError, checkParams } from "../././../shared/utils";
import { PrismaPlacesRespository } from "../respositories/places/PrismaPlacesRespository";
import { PrismaClient } from "@prisma/client";
import { ListPlaces } from "../use_cases/ListPlaces";

export async function handler (event: APIGatewayProxyEvent): Promise<ProxyResult> {
  try {
    const params = getParams(event);

    const prisma = new PrismaClient();
    const placesRepository = new PrismaPlacesRespository(prisma);

    const places = await new ListPlaces(params, placesRepository).execute();

    await prisma.$disconnect();

    return lambdaResponse(200, {
      body: places,
    })
  } catch (error) {
    console.error(error);
    if (error instanceof Error)
      return lambdaError(500, error.message);

    return lambdaError(500, 'Internal Server Error');
  }
}

function getParams(event: APIGatewayProxyEvent) {
  const returnReviews = event.queryStringParameters?.reviews === 'true';

  return {
    reviews: returnReviews
  }
}
