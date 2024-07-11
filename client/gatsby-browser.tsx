import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./src/store";
const App = ({ element }) => {
  return <Provider store={store}>{element}</Provider>;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const wrapRootElement = ({ element }) => {
  return <App element={element} />;
};
