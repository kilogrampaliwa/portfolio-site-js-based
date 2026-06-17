import awsLambdaFastify from "@fastify/aws-lambda";
import { buildApp } from "./app";

let proxyPromise: Promise<ReturnType<typeof awsLambdaFastify>> | undefined;

function getProxy(): Promise<ReturnType<typeof awsLambdaFastify>> {
  proxyPromise ??= buildApp().then(async (app) => {
    const proxy = awsLambdaFastify(app);
    await app.ready();
    return proxy;
  });
  return proxyPromise;
}

export const handler = async (...args: Parameters<Awaited<ReturnType<typeof getProxy>>>) => {
  const proxy = await getProxy();
  return proxy(...args);
};
