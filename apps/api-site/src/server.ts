import { buildApp } from "./app";

const PORT = Number(process.env.PORT ?? 3002);
const HOST = process.env.HOST ?? "0.0.0.0";

const app = await buildApp();

app
  .listen({ port: PORT, host: HOST })
  .then((address) => {
    app.log.info(`API listening at ${address}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
