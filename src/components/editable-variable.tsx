/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import { Card, IconButton, Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { didGameStateDataChange } from "../helpers";
import { Edit } from "@mui/icons-material";
import type { SolutionGameStateData } from "../types";
import { useWithPlayer } from "../store/slices/player/use-with-player-state";

export const EditableVariable = React.memo(
  function EditableVariable(props: {
    dataKey: string;
    title: string;
    myPlayerStateData: SolutionGameStateData;
    onEditVariable: () => void;
    backgroundColor?: string;
  }): React.ReactNode {
    const { player } = useWithPlayer();
    const { myPlayerStateData, dataKey, title } = props;
    const data = myPlayerStateData[dataKey];
    const [value, setValue] = React.useState(data || 0);
    const { classes } = useStyles();

    useEffect(() => {
      setValue(data);
    }, [data]);

    return (
      <Card
        className={classes.box}
        style={{
          backgroundColor: props.backgroundColor || "#fff8db",
          borderColor: "red",
          display: value !== undefined ? "" : "none",
        }}
      >
        <Typography className={classes.text} style={{ color: "#c96049" }}>
          {title}
        </Typography>
        <Typography
          className="panningDisabled"
          sx={{
            color: "#c96049",
            fontSize: 40,
            fontFamily: "SigmarOne",
            textAlign: "center",
            margin: 0,
            padding: 0,
          }}
        >
          {value || 0}
        </Typography>
        {player?.educationalRole === "STUDENT" && (
          <IconButton
            onClick={props.onEditVariable}
            style={{ width: 18, height: 18, marginLeft: 5, color: "#c96049" }}
          >
            <Edit style={{ width: 18, height: 18 }} />
          </IconButton>
        )}
      </Card>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.dataKey === nextProps.dataKey &&
      prevProps.title === nextProps.title &&
      !didGameStateDataChange(
        prevProps.myPlayerStateData,
        nextProps.myPlayerStateData,
      )
    );
  },
);

const useStyles = makeStyles()(() => ({
  box: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 10,
    height: "auto",
    width: "auto",
    minWidth: 100,
    border: "1px solid lightgrey",
    boxShadow: "-5px 5px 10px 0px rgba(0,0,0,0.75)",
  },
  text: {
    color: "white",
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
  },
}));
