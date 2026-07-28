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

import type { GameStateData, GameData } from "../../store/slices/game/types";
import { makeStyles } from "tss-react/mui";
import type { Player } from "../../store/slices/player/types";
import { checkGameAndPlayerStateForValue } from "../../components/discussion-stage-builder/helpers";

import stageBg from "./stage.jpg";
import {
  VIP_TICKET_PERCENT_KEY,
  VIP_TICKET_PRICE,
  VIP_TICKET_CONVERSION_RATE,
  RESERVED_TICKET_PERCENT_KEY,
  RESERVED_TICKET_PRICE,
  RESERVED_TICKET_CONVERSION_RATE,
  GENERAL_ADMISSION_TICKET_PERCENT_KEY,
  GENERAL_ADMISSION_TICKET_PRICE,
  GENERAL_ADMISSION_TICKET_CONVERSION_RATE,
  TOTAL_NUMBER_OF_TICKETS,
  UNDERSTANDS_ADDITION_KEY,
  UNDERSTANDS_MULTIPLICATION_KEY,
  UNDERSTANDS_TICKET_PRICES_KEY,
  UNDERSTANDS_CONVERSION_RATE_KEY,
} from ".";
import { EditableVariable } from "../../components/editable-variable";

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
        backgroundColor: props.backgroundColor || "#301934",
      }}
    >
      <Typography className={classes.text}>{props.title}</Typography>
      <Typography className={classes.boxText} style={{ color: "white" }}>
        {props.prefix || ""}
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
        backgroundColor: "#301934",
        borderColor: "#fff",
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
  const { uiGameData, player, minimize, updatePlayerStateData } = props;
  const { classes } = useStyles();
  const { zoomIn, zoomOut } = useControls();

  const playerGameStateDataRecord: GameStateData =
    uiGameData.playersGameStateData[player._id];
  const globalGameStateDataRecord: GameStateData =
    uiGameData.globalStateData.gameStateData;

  const [editing, setEditing] = React.useState<{
    general: number;
    reserved: number;
    vip: number;
  }>();

  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState<number>(0);
  const [height, setHeight] = React.useState<number>(0);

  const curPlayerStateData = uiGameData.playersGameStateData[player._id];
  const globalGameStateData = uiGameData.globalStateData.gameStateData;

  const understandsTicketPrices = checkGameAndPlayerStateForValue(
    globalGameStateData,
    curPlayerStateData || {},
    UNDERSTANDS_TICKET_PRICES_KEY,
    "true",
  );
  const understandsSellThroughRates = checkGameAndPlayerStateForValue(
    globalGameStateData,
    curPlayerStateData || {},
    UNDERSTANDS_CONVERSION_RATE_KEY,
    "true",
  );
  const understandsMultiplication = checkGameAndPlayerStateForValue(
    globalGameStateData,
    curPlayerStateData || {},
    UNDERSTANDS_MULTIPLICATION_KEY,
    "true",
  );
  const understandsAddition = checkGameAndPlayerStateForValue(
    globalGameStateData,
    curPlayerStateData || {},
    UNDERSTANDS_ADDITION_KEY,
    "true",
  );

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
  }, [width, height, zoomIn, zoomOut]);

  React.useEffect(() => {
    if (!playerGameStateDataRecord) return;
    let vip = playerGameStateDataRecord[VIP_TICKET_PERCENT_KEY] || 0;
    let reserved = playerGameStateDataRecord[RESERVED_TICKET_PERCENT_KEY] || 0;
    let general =
      playerGameStateDataRecord[GENERAL_ADMISSION_TICKET_PERCENT_KEY] || 0;
    vip = Number.parseInt(vip);
    reserved = Number.parseInt(reserved);
    general = Number.parseInt(general);
    const sum = vip + reserved + general;
    if (sum !== 100) {
      general = 100 - vip - reserved;
      if (general < 0) general = 0;
      reserved = 100 - vip - general;
      if (reserved < 0) reserved = 0;
      vip = 100 - reserved - general;
      if (vip < 0) vip = 0;
      updatePlayerStateData(
        {
          [VIP_TICKET_PERCENT_KEY]: vip,
          [RESERVED_TICKET_PERCENT_KEY]: reserved,
          [GENERAL_ADMISSION_TICKET_PERCENT_KEY]: general,
        },
        player._id,
      );
    }
  }, [playerGameStateDataRecord, player._id, updatePlayerStateData]);

  function onClickEdit(): void {
    if (editing) {
      setEditing(undefined);
    } else {
      let vip = playerGameStateDataRecord[VIP_TICKET_PERCENT_KEY] || 0;
      let reserved =
        playerGameStateDataRecord[RESERVED_TICKET_PERCENT_KEY] || 0;
      let general =
        playerGameStateDataRecord[GENERAL_ADMISSION_TICKET_PERCENT_KEY] || 0;
      vip = Number.parseInt(vip);
      reserved = Number.parseInt(reserved);
      general = Number.parseInt(general);
      setEditing({ general, reserved, vip });
    }
  }

  if (minimize) {
    return (
      <div
        className="row spacing"
        style={{ alignItems: "center", overflowX: "auto" }}
      >
        <Typography style={{ whiteSpace: "nowrap" }}>Profit =</Typography>
        <div className="column center-div">
          <Typography
            style={{ whiteSpace: "nowrap", color: "blue", fontSize: 10 }}
          >
            {understandsTicketPrices ? "VIP sales" : ""}
          </Typography>
          <div className="row center-div spacing">
            <Typography
              style={{
                whiteSpace: "nowrap",
                backgroundColor: "lightblue",
                padding: 5,
              }}
            >
              {understandsTicketPrices ? `$${String(VIP_TICKET_PRICE)}` : ``}
            </Typography>
            <Typography style={{ backgroundColor: "lightblue", padding: 5 }}>
              {understandsMultiplication ? "x" : ""}
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
                }[VIP_TICKET_PERCENT_KEY]
              }{" "}
              VIP
            </Typography>
            <Typography style={{ backgroundColor: "lightblue", padding: 5 }}>
              {understandsMultiplication ? "x" : ""}
            </Typography>
            <Typography
              style={{
                whiteSpace: "nowrap",
                backgroundColor: "lightblue",
                padding: 5,
              }}
            >
              {understandsSellThroughRates
                ? `${String(VIP_TICKET_CONVERSION_RATE)}%`
                : ""}
            </Typography>
          </div>
        </div>
        <Typography style={{ backgroundColor: "#ddd", padding: 5 }}>
          {understandsAddition ? "+" : ""}
        </Typography>

        <div className="column center-div">
          <Typography
            style={{ whiteSpace: "nowrap", color: "red", fontSize: 10 }}
          >
            {understandsTicketPrices ? "Reserved sales" : ""}
          </Typography>
          <div className="row center-div spacing">
            <Typography
              style={{
                whiteSpace: "nowrap",
                backgroundColor: "pink",
                padding: 5,
              }}
            >
              {understandsTicketPrices
                ? `$${String(RESERVED_TICKET_PRICE)}`
                : ""}
            </Typography>
            <Typography style={{ backgroundColor: "pink", padding: 5 }}>
              {understandsMultiplication ? "x" : ""}
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
                }[RESERVED_TICKET_PERCENT_KEY]
              }{" "}
              Reserved
            </Typography>
            <Typography style={{ backgroundColor: "pink", padding: 5 }}>
              {understandsMultiplication ? "x" : ""}
            </Typography>
            <Typography style={{ backgroundColor: "pink", padding: 5 }}>
              {understandsSellThroughRates
                ? `${String(RESERVED_TICKET_CONVERSION_RATE)}%`
                : ""}
            </Typography>
          </div>
        </div>
        <Typography style={{ backgroundColor: "#ddd", padding: 5 }}>
          {understandsAddition ? "+" : ""}
        </Typography>

        <div className="column center-div">
          <Typography
            style={{ whiteSpace: "nowrap", color: "brown", fontSize: 10 }}
          >
            {understandsTicketPrices ? "General Admission sales" : ""}
          </Typography>
          <div className="row center-div spacing">
            <Typography
              style={{
                whiteSpace: "nowrap",
                backgroundColor: "tan",
                padding: 5,
              }}
            >
              {understandsTicketPrices
                ? `$${String(GENERAL_ADMISSION_TICKET_PRICE)}`
                : ""}
            </Typography>
            <Typography style={{ backgroundColor: "tan", padding: 5 }}>
              {understandsMultiplication ? "x" : ""}
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
                }[GENERAL_ADMISSION_TICKET_PERCENT_KEY]
              }{" "}
              General
            </Typography>
            <Typography style={{ backgroundColor: "tan", padding: 5 }}>
              {understandsMultiplication ? "x" : ""}
            </Typography>
            <Typography style={{ backgroundColor: "tan", padding: 5 }}>
              {understandsSellThroughRates
                ? `${String(GENERAL_ADMISSION_TICKET_CONVERSION_RATE)}%`
                : ""}
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
        backgroundImage: `url(${stageBg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <TransformComponent>
        <div className="column center-div">
          <Variable
            title="Total # of tickets to sell"
            dataKey=""
            isEnabled={() => true}
            value={String(TOTAL_NUMBER_OF_TICKETS)}
            forceShow={true}
            playerGameStateDataRecord={playerGameStateDataRecord}
            globalGameStateDataRecord={globalGameStateDataRecord}
          />
          <div className="row center-div">
            <Variable
              dataKey={UNDERSTANDS_TICKET_PRICES_KEY}
              isEnabled={() => understandsTicketPrices}
              title="Price per VIP ticket"
              prefix="$"
              value={String(VIP_TICKET_PRICE)}
              playerGameStateDataRecord={playerGameStateDataRecord}
              globalGameStateDataRecord={globalGameStateDataRecord}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: "#fff" }}
                >
                  {" "}
                  x{" "}
                </Typography>
              }
            />
            <EditableVariable
              backgroundColor="#301934"
              dataKey={VIP_TICKET_PERCENT_KEY}
              title="# of VIP tickets"
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
                  style={{ color: "#fff" }}
                >
                  {" "}
                  x{" "}
                </Typography>
              }
            />
            <Variable
              dataKey={UNDERSTANDS_CONVERSION_RATE_KEY}
              isEnabled={() => understandsSellThroughRates}
              title="Conversion Rate"
              value={String(VIP_TICKET_CONVERSION_RATE)}
              playerGameStateDataRecord={playerGameStateDataRecord}
              globalGameStateDataRecord={globalGameStateDataRecord}
            />
          </div>
          <RevealingIcon
            reveal={understandsAddition}
            icon={
              <Typography className={classes.boxText} style={{ color: "#fff" }}>
                {" "}
                +{" "}
              </Typography>
            }
          />
          <div className="row center-div">
            <Variable
              isEnabled={() => understandsTicketPrices}
              dataKey={UNDERSTANDS_TICKET_PRICES_KEY}
              title="Price per reserved ticket"
              prefix="$"
              value={String(RESERVED_TICKET_PRICE)}
              playerGameStateDataRecord={playerGameStateDataRecord}
              globalGameStateDataRecord={globalGameStateDataRecord}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: "#fff" }}
                >
                  {" "}
                  x{" "}
                </Typography>
              }
            />
            <EditableVariable
              backgroundColor="#301934"
              dataKey={RESERVED_TICKET_PERCENT_KEY}
              title="# of Reserved tickets"
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
                  style={{ color: "#fff" }}
                >
                  {" "}
                  x{" "}
                </Typography>
              }
            />
            <Variable
              isEnabled={() => understandsSellThroughRates}
              dataKey={UNDERSTANDS_CONVERSION_RATE_KEY}
              title="Conversion Rate"
              value={String(RESERVED_TICKET_CONVERSION_RATE)}
              playerGameStateDataRecord={playerGameStateDataRecord}
              globalGameStateDataRecord={globalGameStateDataRecord}
            />
          </div>
          <RevealingIcon
            reveal={understandsAddition}
            icon={
              <Typography className={classes.boxText} style={{ color: "#fff" }}>
                {" "}
                +{" "}
              </Typography>
            }
          />
          <div className="row center-div">
            <Variable
              dataKey={UNDERSTANDS_TICKET_PRICES_KEY}
              isEnabled={() => understandsTicketPrices}
              title="Price per GA ticket"
              prefix="$"
              value={String(GENERAL_ADMISSION_TICKET_PRICE)}
              playerGameStateDataRecord={playerGameStateDataRecord}
              globalGameStateDataRecord={globalGameStateDataRecord}
            />
            <RevealingIcon
              reveal={understandsMultiplication}
              icon={
                <Typography
                  className={classes.boxText}
                  style={{ color: "#fff" }}
                >
                  {" "}
                  x{" "}
                </Typography>
              }
            />
            <EditableVariable
              backgroundColor="#301934"
              dataKey={GENERAL_ADMISSION_TICKET_PERCENT_KEY}
              title="# of GA tickets"
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
                  style={{ color: "#fff" }}
                >
                  {" "}
                  x{" "}
                </Typography>
              }
            />
            <Variable
              dataKey={UNDERSTANDS_CONVERSION_RATE_KEY}
              isEnabled={() => understandsSellThroughRates}
              title="Conversion Rate"
              value={String(GENERAL_ADMISSION_TICKET_CONVERSION_RATE)}
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
              label="Number of VIP Tickets"
              defaultValue={
                playerGameStateDataRecord[VIP_TICKET_PERCENT_KEY] || 0
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
                setEditing({ ...editing, vip: parseInt(e.target.value) });
              }}
            />
            <TextField
              label="Number of Reserved Tickets"
              defaultValue={
                playerGameStateDataRecord[RESERVED_TICKET_PERCENT_KEY] || 0
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
                setEditing({ ...editing, reserved: parseInt(e.target.value) });
              }}
            />
            <TextField
              label="Number of General Tickets"
              defaultValue={
                playerGameStateDataRecord[
                  GENERAL_ADMISSION_TICKET_PERCENT_KEY
                ] || 0
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
                setEditing({ ...editing, general: parseInt(e.target.value) });
              }}
            />
            {editing.vip + editing.general + editing.reserved !== 100 && (
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
              disabled={
                editing.vip + editing.general + editing.reserved !== 100
              }
              onClick={() => {
                updatePlayerStateData(
                  {
                    [GENERAL_ADMISSION_TICKET_PERCENT_KEY]: editing.general,
                    [RESERVED_TICKET_PERCENT_KEY]: editing.reserved,
                    [VIP_TICKET_PERCENT_KEY]: editing.vip,
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
