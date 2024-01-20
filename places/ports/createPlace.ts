import { APIGatewayProxyEvent, ProxyResult } from "aws-lambda";
import { lambdaResponse, lambdaError, checkParams } from "../././../shared/utils";
import { PrismaPlacesRespository } from "../respositories/places/PrismaPlacesRespository";
import { PrismaClient } from "@prisma/client";
import { CreatePlace } from "../use_cases/CreatePlace";

export async function handler (event: APIGatewayProxyEvent): Promise<ProxyResult> {
  try {
    const params = lambdaGetParams(event);

    const errors = checkParams(params, ['name', 'description', 'url']);
    if (errors.length > 0) {
      const message = `Missing required fields: ${errors.join(', ')}`
      return lambdaError(400, message);
    }

    // move into a service start
    const prisma = new PrismaClient();

    const placesRepository = new PrismaPlacesRespository(prisma);

    const place = await new CreatePlace({
      data: params,
      placesRepository 
    }).execute();

    await prisma.$disconnect();
    // end


    return lambdaResponse(201, {
      body: place,
      headers: {
        Location: `/places/${place.slug}`
      }
    })
  } catch (error) {
    if (error instanceof Error) 
      return lambdaError(500, error.message);
    
    return lambdaError(500, 'Internal Server Error');
  }
}

function lambdaGetParams(event: APIGatewayProxyEvent) {
  const body = JSON.parse(event.body || '{}');

  return {
    name: body.name,
    description: body.description,
    url: body.url,
  }
}
