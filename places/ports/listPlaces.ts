import { APIGatewayProxyEvent, ProxyResult } from "aws-lambda";
import { lambdaResponse, lambdaError, checkParams } from "../././../shared/utils";
import { PrismaPlacesRespository } from "../respositories/places/PrismaPlacesRespository";
import { PrismaClient } from "@prisma/client";
import { ListPlaces } from "../use_cases/ListPlaces";

export async function handler (event: APIGatewayProxyEvent): Promise<ProxyResult> {
  try {
    const prisma = new PrismaClient();
    const placesRepository = new PrismaPlacesRespository(prisma);

    const places = await new ListPlaces(placesRepository).execute();

    await prisma.$disconnect();

    return lambdaResponse(201, {
      body: places,
    })
  } catch (error) {
    if (error instanceof Error)
      return lambdaError(500, error.message);

    return lambdaError(500, 'Internal Server Error');
  }
}
