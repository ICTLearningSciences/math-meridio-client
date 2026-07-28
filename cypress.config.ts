import { defineConfig } from "cypress";
import dotenvCypress from 'cypress-dotenv';

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
  },

  env: {
    REFRESH_TOKEN_NAME: "refreshTokenDev",
    VITE_GRAPHQL_ENDPOINT: "http://localhost:80/graphql/graphql",
  },

  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
    setupNodeEvents(on, config) {
      return dotenvCypress(config, undefined, true);
    },
    // devServer: {
    //   framework: "create-react-app",
    //   bundler: "webpack",
    // },
  },
});
