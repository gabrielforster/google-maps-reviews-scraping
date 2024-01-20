type Options = { 
  body: any,
  headers?: {
    [key: string]: string
  }
}

export function lambdaResponse(statusCode: number, { body, headers }: Options) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

export function lambdaError(statusCode: number, message: string) {
  return lambdaResponse(statusCode, { 
    body: { error: message }
  });
}

export function checkParams(params: any, requiredParams: string[]) {
  const missingParams = requiredParams.filter((param) => !params[param]);
  
  return missingParams;
}
