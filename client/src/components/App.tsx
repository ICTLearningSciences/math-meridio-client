/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Grid } from "@mui/material";
import ChatThread from "./ChatThread";
import ChatForm from "./ChatForm";
import PhaserGame from "./PhaserGame";
import { useWithHydrateRedux } from "../store/use-with-hydrate-redux";
import { Header } from "./header";

export default function App(): JSX.Element {
  useWithHydrateRedux(); // NOTE: make sure to have this at the earliest point w/ store
  return (
    <div className="root">
      {/* <Header /> */}
      <Grid container xs={true} flexDirection="row">
        <Grid item xs={9}>
          <PhaserGame />
        </Grid>
        <Grid item xs={3} display="flex" flexDirection="column">
          <ChatThread />
          <ChatForm />
        </Grid>
      </Grid>
    </div>
  );
}
