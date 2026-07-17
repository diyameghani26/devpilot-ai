import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`DevPilot AI backend running in ${env.nodeEnv} mode on port ${env.port}`);
});
