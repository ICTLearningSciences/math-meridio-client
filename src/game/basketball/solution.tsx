/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useRef } from "react";
import { TransformComponent, useControls } from "react-zoom-pan-pinch";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import type { GameData, GameStateData } from "../../store/slices/game/types";
import { makeStyles } from "tss-react/mui";
import type { Player } from "../../store/slices/player/types";
import { checkGameAndPlayerStateForValue } from "../../components/discussion-stage-builder/helpers";
import { EditableVariable } from "../../components/editable-variable";

export const NUMBER_OF_SHOTS = 100;
export const INSIDE_SHOT_PERCENT = "inside_shot_percent";
export const INSIDE_SHOT_POINTS_VALUE = 2;
export const INSIDE_SHOT_SUCCESS_VALUE = 0.5;

export const MID_SHOT_PERCENT = "middle_shot_percent";
export const MID_SHOT_POINTS_VALUE = 2;
export const MID_SHOT_SUCCESS_VALUE = 0.4;

export const OUTSIDE_SHOT_PERCENT = "outside_shot_percent";
export const OUTSIDE_SHOT_POINTS_VALUE = 3;
export const OUTSIDE_SHOT_SUCCESS_VALUE = 0.36;

export const UNDERSTANDS_SUCCESS_SHOTS = "understands_success_shots";
export const UNDERSTANDS_SHOT_POINTS = "understands_shot_points";
export const UNDERSTANDS_MULTIPLICATION = "understands_multiplication";
export const UNDERSTANDS_ADDITION = "understands_addition";

import courtBg from "./court.png";

function Variable(props: {
  dataKey: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isEnabled: (value: any) => boolean;
  value?: string;
  forceShow?: boolean;
  prefix?: string;
  backgroundColor?: string;
  globalGameStateDataRecord: GameStateData;
  playerGameStateDataRecord: GameStateData;
}): React.ReactNode {
  const { isEnabled, globalGameStateDataRecord, playerGameStateDataRecord } =
    props;
  const { classes } = useStyles();
  const data =
    globalGameStateDataRecord?.[props.dataKey] ||
    playerGameStateDataRecord?.[props.dataKey];
  const value =
    props.value ||
    globalGameStateDataRecord?.[props.dataKey] ||
    playerGameStateDataRecord?.[props.dataKey];

  return (
    <Card
      className={classes.box}
      style={{
        display: props.forceShow || (data && isEnabled(data)) ? "" : "none",
        backgroundColor: "#e3a363",
      }}
    >
      <Typography className={classes.text}>{props.title}</Typography>
      <Typography className={classes.boxText} style={{ color: "white" }}>
        {value}
      </Typography>
    </Card>
  );
}

/**
 * A component that will reveal the icon when reveal is true, and never hide it again.
 */
function RevealingIcon(props: {
  reveal: boolean;
  icon: React.ReactNode;
}): React.ReactNode {
  const { reveal, icon } = props;
  const { classes } = useStyles();

  return (
    <Card
      className={classes.box}
      style={{
        backgroundColor: "#E3A363",
        borderColor: "#C96049",
        padding: 0,
        width: 50,
        height: 50,
        minWidth: 50,
        minHeight: 50,
        borderRadius: 50,
        display: reveal ? "" : "none",
      }}
    >
      <Typography className={classes.boxText}>{icon}</Typography>
    </Card>
  );
}

export function SolutionComponent(props: {
  uiGameData: GameData;
  player: Player;
  updatePlayerStateData: (
    newPlayerStateData: GameStateData,
    playerId: string,
  ) => void;
  minimize?: boolean;
}): React.ReactNode {
  const { uiGameData, player, updatePlayerStateData } = props;
  const { classes } = useStyles();
  const { zoomIn, zoomOut } = useControls();

  const playerGameStateDataRecord: GameStateData =
    uiGameData.playersGameStateData[player._id];
  const globalGameStateDataRecord: GameStateData =
    uiGameData.globalStateData.gameStateData;
  const [editing, setEditing] = React.useState<{
    inside: number;
    mid: number;
    outside: number;
  }>();

  const curPlayerStateData = uiGameData.playersGameStateData[player._id];
  const globalGameStateData = uiGameData.globalStateData.gameStateData;
  const understandsPoints = checkGameAndPlayerStateForValue(
    globalGameStateData,
    curPlayerStateData,
    UNDERSTANDS_SHOT_POINTS,
    "true",
  );
  const understandsSuccess = checkGameAndPlayerStateForValue(
    globalGameStateData,
    curPlayerStateData,
    UNDERSTANDS_SUCCESS_SHOTS,
    "true",
  );
  const understandsMultiplication = checkGameAndPlayerStateForValue(
    globalGameStateData,
    curPlayerStateData,
    UNDERSTANDS_MULTIPLICATION,
    "true",
  );
  const understandsAddition = checkGameAndPlayerStateForValue(
    globalGameStateData,
    curPlayerStateData,
    UNDERSTANDS_ADDITION,
    "true",
  );

  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState<number>(0);
  const [height, setHeight] = React.useState<number>(0);

  React.useEffect(() => {
    if (ref?.current) {
      new ResizeObserver(() => {
        setWidth(ref?.current?.clientWidth || 0);
        setHeight(ref?.current?.clientHeight || 0);
      }).observe(ref?.current);
    }
  }, []);

  React.useEffect(() => {
    if (width < 500 || height < 500) {
      zoomOut(1);
    } else {
      zoomIn(1);
    }
  }, [width, height]);

  React.useEffect(() => {
    if (!playerGameStateDataRecord) return;
    let outside = playerGameStateDataRecord[OUTSIDE_SHOT_PERCENT] || 0;
    let mid = playerGameStateDataRecord[MID_SHOT_PERCENT] || 0;
    let inside = playerGameStateDataRecord[INSIDE_SHOT_PERCENT] || 0;
    outside = Number.parseInt(outside);
    mid = Number.parseInt(mid);
    inside = Number.parseInt(inside);
    const sum = outside + mid + inside;
    if (sum !== 100) {
      inside = 100 - outside - mid;
      if (inside < 0) inside = 0;
      mid = 100 - outside - inside;
      if (mid < 0) mid = 0;
      outside = 100 - inside - mid;
      if (outside < 0) outside = 0;
      updatePlayerStateData(
        {
          [OUTSIDE_SHOT_PERCENT]: outside,
          [MID_SHOT_PERCENT]: mid,
          [INSIDE_SHOT_PERCENT]: inside,
        },
        player._id,
      );
    }
  }, [playerGameStateDataRecord]);

  function onClickEdit(): void {
    if (editing) {
      setEditing(undefined);
    } else {
      let outside = playerGameStateDataRecord[OUTSIDE_SHOT_PERCENT] || 0;
      let mid = playerGameStateDataRecord[MID_SHOT_PERCENT] || 0;
      let inside = playerGameStateDataRecord[INSIDE_SHOT_PERCENT] || 0;
      outside = Number.parseInt(outside);
      mid = Number.parseInt(mid);
      inside = Number.parseInt(inside);
      setEditing({ inside, mid, outside });
    }
  }

  if (props.minimize) {
    return (
      <div
        className="row spacing"
        style={{ alignItems: "center", overflowX: "auto" }}
      >
        <Typography style={{ whiteSpace: "nowrap" }}>Points =</Typography>
        <div className="column center-div">
          <Typography
            style={{ whiteSpace: "nowrap", color: "blue", fontSize: 10 }}
          >
            {understandsPoints ? "Inside points" : ""}
          </Typography>
          <div className="row center-div spacing">
            <Typography
              style={{
                whiteSpace: "nowrap",
                backgroundColor: "lightblue",
                padding: 5,
              }}
            >
              {understandsPoints
                ? `${String(INSIDE_SHOT_POINTS_VALUE)} points`
                : `?`}
            </Typography>
            <Typography style={{ backgroundColor: "lightblue", padding: 5 }}>
              {understandsMultiplication ? "X" : "?"}
            </Typography>
            <Typography
              style={{
                whiteSpace: "nowrap",
                backgroundColor: "lightblue",
                padding: 5,
              }}
            >
              {
                {
                  ...globalGameStateDataRecord,
                  ...playerGameStateDataRecord,
                }[INSIDE_SHOT_PERCENT]
              }{" "}
              Inside Shots
            </Typography>
            <Typography style={{ backgroundColor: "lightblue", padding: 5 }}>
              {understandsMultiplication ? "X" : "?"}
            </Typography>
            <Typography
              style={{
                whiteSpace: "nowrap",
                backgroundColor: "lightblue",
                padding: 5,
              }}
            >
              {understandsSuccess
                ? `${String(INSIDE_SHOT_SUCCESS_VALUE)}%`
                : `?`}
            </Typography>
          </div>
        </div>
        <Typography style={{ backgroundColor: "#ddd", padding: 5 }}>
          {understandsAddition ? "+" : "?"}
        </Typography>

        <div className="column center-div">
          <Typography
            style={{ whiteSpace: "nowrap", color: "red", fontSize: 10 }}
          >
            {understandsPoints ? "Midlane points" : ""}
          </Typography>
          <div className="row center-div spacing">
            <Typography
              style={{
                whiteSpace: "nowrap",
                backgroundColor: "pink",
                padding: 5,
              }}
            >
              {understandsPoints
                ? `${String(MID_SHOT_POINTS_VALUE)} points`
                : `?`}
            </Typography>
            <Typography style={{ backgroundColor: "pink", padding: 5 }}>
              {understandsMultiplication ? "X" : "?"}
            </Typography>
            <Typography
              style={{
                whiteSpace: "nowrap",
                backgroundColor: "pink",
                padding: 5,
              }}
            >
              {
                {
                  ...globalGameStateDataRecord,
                  ...playerGameStateDataRecord,
                }[MID_SHOT_PERCENT]
              }{" "}
              Midlane Shots
            </Typography>
            <Typography style={{ backgroundColor: "pink", padding: 5 }}>
              {understandsMultiplication ? "X" : "?"}
            </Typography>
            <Typography style={{ backgroundColor: "pink", padding: 5 }}>
              {understandsSuccess ? `${String(MID_SHOT_SUCCESS_VALUE)}%` : `?`}
            </Typography>
          </div>
        </div>
        <Typography style={{ backgroundColor: "#ddd", padding: 5 }}>
          {understandsAddition ? "+" : "?"}
        </Typography>

        <div className="column center-div">
          <Typography
            style={{ whiteSpace: "nowrap", color: "brown", fontSize: 10 }}
          >
            {understandsPoints ? "Outside points" : ""}
          </Typography>
          <div className="row center-div spacing">
            <Typography
              style={{
                whiteSpace: "nowrap",
                backgroundColor: "tan",
                padding: 5,
              }}
            >
              {understandsPoints
                ? `${String(OUTSIDE_SHOT_POINTS_VALUE)} points`
                : `?`}
            </Typography>
            <Typography style={{ backgroundColor: "tan", padding: 5 }}>
              {understandsMultiplication ? "X" : "?"}
            </Typography>
            <Typography
              style={{
                whiteSpace: "nowrap",
                backgroundColor: "tan",
                padding: 5,
              }}
            >
              {
                {
                  ...globalGameStateDataRecord,
                  ...playerGameStateDataRecord,
                }[OUTSIDE_SHOT_PERCENT]
              }{" "}
              Outside Shots
            </Typography>
            <Typography style={{ backgroundColor: "tan", padding: 5 }}>
              {understandsMultiplication ? "X" : "?"}
            </Typography>
            <Typography style={{ backgroundColor: "tan", padding: 5 }}>
              {understandsSuccess
                ? `${String(OUTSIDE_SHOT_SUCCESS_VALUE)}%`
                : `?`}
            </Typography>
          </div>
        </div>
        <TransformComponent>
          <div />
        </TransformComponent>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="column center-div"
      style={{
        height: "100%",
        width: "100%",
        backgroundImage: `url(${courtBg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <TransformComponent>
        <div className="column center-div">
          <Variable
            title="# of shots"
            dataKey=""
            isEnabled={() => true}
            value={String(NUMBER_OF_SHOTS)}
            forceShow={true}
            playerGameStateDataRecord={playerGameStateDataRecord}
            globalGameStateDataRecord={globalGameStateDataRecord}
          />
          <div className="row center-div">
            <Variable
              dataKey={UNDERSTANDS_SHOT_POINTS}
              isEnabled={() => understandsPoints}
              title="Points per inside shot"
              value={String(INSIDE_SHOT_POINTS_VALUE)}
              playerGameStateDataRecord={playerGameStateDataRecord}
              globalGameStateDataRecord={globalGameStateDataRecord}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: "#C96049" }}
                >
                  {" "}
                  x{" "}
                </Typography>
              }
            />
            <EditableVariable
              dataKey={INSIDE_SHOT_PERCENT}
              title="# of inside shots"
              myPlayerStateData={{
                ...globalGameStateDataRecord,
                ...playerGameStateDataRecord,
              }}
              onEditVariable={onClickEdit}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: "#C96049" }}
                >
                  {" "}
                  x{" "}
                </Typography>
              }
            />
            <Variable
              dataKey={UNDERSTANDS_SUCCESS_SHOTS}
              isEnabled={() => understandsSuccess}
              title="Success% of inside shots"
              value={String(INSIDE_SHOT_SUCCESS_VALUE)}
              playerGameStateDataRecord={playerGameStateDataRecord}
              globalGameStateDataRecord={globalGameStateDataRecord}
            />
          </div>
          <RevealingIcon
            reveal={understandsAddition}
            icon={
              <Typography
                className={classes.boxText}
                style={{ color: "#C96049" }}
              >
                {" "}
                +{" "}
              </Typography>
            }
          />
          <div className="row center-div">
            <Variable
              isEnabled={() => understandsPoints}
              dataKey={UNDERSTANDS_SHOT_POINTS}
              title="Points per mid shot"
              value={String(MID_SHOT_POINTS_VALUE)}
              playerGameStateDataRecord={playerGameStateDataRecord}
              globalGameStateDataRecord={globalGameStateDataRecord}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: "#C96049" }}
                >
                  {" "}
                  x{" "}
                </Typography>
              }
            />
            <EditableVariable
              dataKey={MID_SHOT_PERCENT}
              title="# of mid shots"
              myPlayerStateData={{
                ...globalGameStateDataRecord,
                ...playerGameStateDataRecord,
              }}
              onEditVariable={onClickEdit}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: "#C96049" }}
                >
                  {" "}
                  x{" "}
                </Typography>
              }
            />
            <Variable
              isEnabled={() => understandsSuccess}
              dataKey={UNDERSTANDS_SUCCESS_SHOTS}
              title="Success% of mid shots"
              value={String(MID_SHOT_SUCCESS_VALUE)}
              playerGameStateDataRecord={playerGameStateDataRecord}
              globalGameStateDataRecord={globalGameStateDataRecord}
            />
          </div>
          <RevealingIcon
            reveal={understandsAddition}
            icon={
              <Typography
                className={classes.boxText}
                style={{ color: "#C96049" }}
              >
                {" "}
                +{" "}
              </Typography>
            }
          />
          <div className="row center-div">
            <Variable
              dataKey={UNDERSTANDS_SHOT_POINTS}
              isEnabled={() => understandsPoints}
              title="Points per outside shot"
              value={String(OUTSIDE_SHOT_POINTS_VALUE)}
              playerGameStateDataRecord={playerGameStateDataRecord}
              globalGameStateDataRecord={globalGameStateDataRecord}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: "#C96049" }}
                >
                  {" "}
                  x{" "}
                </Typography>
              }
            />
            <EditableVariable
              dataKey={OUTSIDE_SHOT_PERCENT}
              title="# of 3 pointers"
              myPlayerStateData={{
                ...globalGameStateDataRecord,
                ...playerGameStateDataRecord,
              }}
              onEditVariable={onClickEdit}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: "#C96049" }}
                >
                  {" "}
                  x{" "}
                </Typography>
              }
            />
            <Variable
              dataKey={UNDERSTANDS_SUCCESS_SHOTS}
              isEnabled={() => understandsSuccess}
              title="Success% of outside shots"
              value={String(OUTSIDE_SHOT_SUCCESS_VALUE)}
              playerGameStateDataRecord={playerGameStateDataRecord}
              globalGameStateDataRecord={globalGameStateDataRecord}
            />
          </div>
        </div>
      </TransformComponent>

      {editing && (
        <Dialog open={Boolean(editing)} onClose={onClickEdit}>
          <DialogTitle style={{ textAlign: "center" }}>My Strategy</DialogTitle>
          <DialogContent style={{ paddingTop: 10 }}>
            <TextField
              label="Number of Inside Shots"
              defaultValue={playerGameStateDataRecord[INSIDE_SHOT_PERCENT] || 0}
              type="number"
              fullWidth
              style={{ marginBottom: 10 }}
              sx={{
                input: {
                  color: "#c96049",
                  fontSize: 40,
                  fontFamily: "SigmarOne",
                  textAlign: "center",
                  backgroundColor: "#fff8db",
                },
                "& .MuiInput-underline:before": {
                  borderBottomColor: "#c96049",
                },
                "& .MuiInput-underline:after": { borderBottomColor: "#c96049" },
              }}
              slotProps={{
                input: {
                  inputProps: {
                    min: 0,
                    max: 100,
                  },
                },
              }}
              onChange={(e) => {
                setEditing({ ...editing, inside: parseInt(e.target.value) });
              }}
            />
            <TextField
              label="Number of Mid Shots"
              defaultValue={playerGameStateDataRecord[MID_SHOT_PERCENT] || 0}
              type="number"
              fullWidth
              style={{ marginBottom: 10 }}
              sx={{
                input: {
                  color: "#c96049",
                  fontSize: 40,
                  fontFamily: "SigmarOne",
                  textAlign: "center",
                  backgroundColor: "#fff8db",
                },
                "& .MuiInput-underline:before": {
                  borderBottomColor: "#c96049",
                },
                "& .MuiInput-underline:after": { borderBottomColor: "#c96049" },
              }}
              slotProps={{
                input: {
                  inputProps: {
                    min: 0,
                    max: 100,
                  },
                },
              }}
              onChange={(e) => {
                setEditing({ ...editing, mid: parseInt(e.target.value) });
              }}
            />
            <TextField
              label="Number of 3 Pointers"
              defaultValue={
                playerGameStateDataRecord[OUTSIDE_SHOT_PERCENT] || 0
              }
              type="number"
              fullWidth
              style={{ marginBottom: 10 }}
              sx={{
                input: {
                  color: "#c96049",
                  fontSize: 40,
                  fontFamily: "SigmarOne",
                  textAlign: "center",
                  backgroundColor: "#fff8db",
                },
                "& .MuiInput-underline:before": {
                  borderBottomColor: "#c96049",
                },
                "& .MuiInput-underline:after": { borderBottomColor: "#c96049" },
              }}
              slotProps={{
                input: {
                  inputProps: {
                    min: 0,
                    max: 100,
                  },
                },
              }}
              onChange={(e) => {
                setEditing({ ...editing, outside: parseInt(e.target.value) });
              }}
            />
            {editing.outside + editing.mid + editing.inside !== 100 && (
              <Typography color="error" style={{ textAlign: "center" }}>
                Total must add up to 100
              </Typography>
            )}
          </DialogContent>
          <DialogActions style={{ justifyContent: "center" }}>
            <Button onClick={onClickEdit} color="primary" variant="outlined">
              Close
            </Button>
            <Button
              color="primary"
              variant="contained"
              disabled={editing.outside + editing.mid + editing.inside !== 100}
              onClick={() => {
                updatePlayerStateData(
                  {
                    [OUTSIDE_SHOT_PERCENT]: editing.outside,
                    [MID_SHOT_PERCENT]: editing.mid,
                    [INSIDE_SHOT_PERCENT]: editing.inside,
                  },
                  player._id,
                );
                onClickEdit();
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

const useStyles = makeStyles()(() => ({
  grouping: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
  },
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
  boxText: {
    color: "white",
    fontSize: 40,
    fontFamily: "SigmarOne",
  },
}));
