import { Context, ScheduledEvent, APIGatewayProxyEvent } from 'aws-lambda';

export async function run (event: APIGatewayProxyEvent | ScheduledEvent, context: Context) {
  console.log(event);
  const time = new Date();
  console.log(`Your cron function "${context.functionName}" ran at ${time}`);
};
