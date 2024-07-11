import React from "react";
import { Provider } from "react-redux";
import { store } from "./src/store";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const wrapRootElement = ({ element }) => (
  <Provider store={store}>{element}</Provider>
);
