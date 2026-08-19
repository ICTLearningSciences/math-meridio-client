/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import {
  Stack,
  Typography,
  Tabs,
  Tab,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  LinearProgress,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import type { SocialMediaSimulationData } from "./SimulationScene";
import {
  SHORT_DANCE_PRICE,
  LONG_DANCE_PRICE,
  INSTRUCTIONAL_TICKET_PRICE,
  SHORT_DANCE_PERCENT_KEY,
  LONG_DANCE_PERCENT_KEY,
  INSTRUCTIONAL_PERCENT_KEY,
  INSTRUCTIONAL_CONVERSION_RATE,
  LONG_DANCE_CONVERSION_RATE,
  SHORT_DANCE_CONVERSION_RATE,
} from ".";
import type { GameData } from "../../store/slices/game/types";
import AvatarSprite from "../../components/avatar-sprite";
import { EmojiEvents } from "@mui/icons-material";
import { useAppSelector } from "../../store/hooks";

export function Leaderboard(props: {
  gameData: GameData;
  simData: Record<string, SocialMediaSimulationData>;
}): React.ReactNode {
  const { gameData, simData } = props;
  const me = useAppSelector((state) => state.playerData.player);
  const data = Object.values(simData).sort(
    (a, b) => b.totalProfit - a.totalProfit,
  );
  const topScore = data[0]?.totalProfit;

  return (
    <div className="column spacing">
      <Typography style={{ fontWeight: "bold" }}>Leaderboard</Typography>
      <List>
        {data.map((data, i) => {
          const player = gameData.players.find((p) => p._id === data.player);
          const isTop = data.totalProfit === topScore;
          const color = isTop ? "gold" : i === 1 ? "#CD7F32" : "";
          return (
            <ListItem key={i} className="row">
              <ListItemAvatar
                className="row center-div spacing"
                style={{ marginRight: 10 }}
              >
                <Avatar sx={{ width: 24, height: 24, backgroundColor: color }}>
                  <Typography
                    style={{
                      fontSize: 12,
                    }}
                  >
                    {i + 1}
                  </Typography>
                </Avatar>
                <AvatarSprite bgColor={"rgb(217, 217, 217)"} player={player} />
              </ListItemAvatar>
              <div style={{ flexGrow: 1, marginRight: 5 }}>
                <Typography style={{ fontWeight: "bold" }}>
                  {player?.name} {me?._id === player?._id ? " (Me) " : ""}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(data?.totalProfit / 2700) * 100}
                  style={{
                    height: 10,
                    borderRadius: 10,
                    marginTop: 5,
                    marginBottom: 5,
                  }}
                />
                <Typography color="primary" variant="subtitle2">
                  ${data?.totalProfit || 0}
                </Typography>
              </div>
              <EmojiEvents
                sx={{ color: color, visibility: isTop ? "" : "hidden" }}
              />
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}

export function ResultComponent(props: {
  uiGameData: GameData;
}): React.ReactNode {
  const { uiGameData } = props;
  const [simulationData, setSimulationData] = React.useState<
    Record<string, SocialMediaSimulationData>
  >({});

  const chartHeight = 300;
  const resultsWidth = window.innerWidth / 2 - 100;
  const scoreChartWidth = resultsWidth;
  const ticketsChartWidth = resultsWidth / uiGameData.players.length;
  const initialChartData: ChartData = {
    profitFromVipTickets: [],
    profitFromReservedTickets: [],
    profitFromGeneralAdmissionTickets: [],
    player1Data: [],
    player1MissedData: [],
    player2Data: [],
    player2MissedData: [],
    player3Data: [],
    player3MissedData: [],
    player4Data: [],
    player4MissedData: [],
    playerLabels: [],
  };
  const [myChartData, setMyChartData] = useState<ChartData>(initialChartData);
  const ticketLabels = ["VIP", "Reserved", "General Admission"];
  const [tabValue, setTabValue] = useState(0);

  interface ChartData {
    profitFromVipTickets: number[];
    profitFromReservedTickets: number[];
    profitFromGeneralAdmissionTickets: number[];
    player1Data: number[];
    player1MissedData: number[];
    player2Data: number[];
    player2MissedData: number[];
    player3Data: number[];
    player3MissedData: number[];
    player4Data: number[];
    player4MissedData: number[];
    playerLabels: string[];
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  function simulationEnded(data: SocialMediaSimulationData): void {
    const simData = { ...simulationData };
    simData[data.player] = data;
    let player1Data: number[] = [];
    let player1MissedData: number[] = [];
    let player2Data: number[] = [];
    let player2MissedData: number[] = [];
    let player3Data: number[] = [];
    let player3MissedData: number[] = [];
    let player4Data: number[] = [];
    let player4MissedData: number[] = [];
    for (let index = 0; index < uiGameData.players.length; index++) {
      const player = uiGameData.players[index];
      const playerMade = [
        simData[player._id]?.instructionalsViewed,
        simData[player._id]?.danceLongsViewed,
        simData[player._id]?.danceShortsViewed,
      ];
      const playerMissed = [
        simData[player._id]?.instructionals -
          simData[player._id]?.instructionalsViewed,
        simData[player._id]?.danceLongs - simData[player._id]?.danceLongsViewed,
        simData[player._id]?.danceShorts -
          simData[player._id]?.danceShortsViewed,
      ];
      switch (index) {
        case 0:
          player1Data = playerMade;
          player1MissedData = playerMissed;
          break;
        case 1:
          player2Data = playerMade;
          player2MissedData = playerMissed;
          break;
        case 2:
          player3Data = playerMade;
          player3MissedData = playerMissed;
          break;
        case 3:
          player4Data = playerMade;
          player4MissedData = playerMissed;
          break;
      }
    }
    const playerLabels = uiGameData.players.map((player) => player.name);
    const chartData = {
      profitFromVipTickets: uiGameData.players.map(
        (player) =>
          (simData[player._id]?.instructionalsViewed || 0) * SHORT_DANCE_PRICE,
      ),
      profitFromReservedTickets: uiGameData.players.map(
        (player) =>
          (simData[player._id]?.danceLongsViewed || 0) * LONG_DANCE_PRICE,
      ),
      profitFromGeneralAdmissionTickets: uiGameData.players.map(
        (player) =>
          (simData[player._id]?.danceShortsViewed || 0) *
          INSTRUCTIONAL_TICKET_PRICE,
      ),
      player1Data,
      player1MissedData,
      player2Data,
      player2MissedData,
      player3Data,
      player3MissedData,
      player4Data,
      player4MissedData,
      playerLabels,
    };
    setMyChartData(chartData);
    setSimulationData({ ...simData });
  }

  function GetChartFor(
    playerData: number[],
    playerMissedData: number[],
    playerName: string,
    index: number,
  ) {
    return (
      <Stack key={index} direction="column" style={{ alignItems: "center" }}>
        <BarChart
          width={ticketsChartWidth}
          height={chartHeight}
          series={[
            { data: playerData, label: "sold", stack: "tickets" },
            {
              data: playerMissedData,
              label: "unsold",
              stack: "tickets",
            },
          ]}
          xAxis={[{ data: ticketLabels, scaleType: "band" }]}
        />
        <Typography variant="subtitle1">{playerName}</Typography>
      </Stack>
    );
  }

  React.useEffect(() => {
    for (const player of props.uiGameData.players) {
      const psd = props.uiGameData.playersGameStateData[player._id];
      const vipTicketsUpForSale = psd[SHORT_DANCE_PERCENT_KEY] || 0;
      const reservedTicketsUpForSale = psd[LONG_DANCE_PERCENT_KEY] || 0;
      const generalAdmissionTicketsUpForSale =
        psd[INSTRUCTIONAL_PERCENT_KEY] || 0;
      const generalAdmissionTicketsSold = Math.round(
        generalAdmissionTicketsUpForSale * INSTRUCTIONAL_CONVERSION_RATE,
      );
      const reservedTicketsSold = Math.round(
        reservedTicketsUpForSale * LONG_DANCE_CONVERSION_RATE,
      );
      const vipTicketsSold = Math.round(
        vipTicketsUpForSale * SHORT_DANCE_CONVERSION_RATE,
      );
      const total =
        generalAdmissionTicketsSold * INSTRUCTIONAL_TICKET_PRICE +
        reservedTicketsSold * LONG_DANCE_PRICE +
        vipTicketsSold * SHORT_DANCE_PRICE;
      const simData: SocialMediaSimulationData = {
        player: player._id,
        playerAvatar: player,
        danceShorts: generalAdmissionTicketsUpForSale,
        danceShortsViewed: generalAdmissionTicketsSold,
        danceLongs: reservedTicketsUpForSale,
        danceLongsViewed: reservedTicketsSold,
        instructionals: vipTicketsUpForSale,
        instructionalsViewed: vipTicketsSold,
        totalProfit: total,
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      simulationEnded(simData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.uiGameData.playersGameStateData, props.uiGameData.players]);

  return (
    <Stack
      direction="column"
      style={{ alignItems: "center", width: resultsWidth }}
    >
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Profits" />
        <Tab label="Tickets Sold" />
      </Tabs>
      <Box sx={{ width: "100%", height: "100%", mt: 2 }}>
        {tabValue === 0 && (
          <Stack direction="column" style={{ alignItems: "center" }}>
            <BarChart
              width={scoreChartWidth}
              height={chartHeight}
              series={[
                {
                  data: myChartData.profitFromVipTickets,
                  label: "VIP",
                  stack: "profit",
                  color: "rgb(150,221,242)",
                },
                {
                  data: myChartData.profitFromReservedTickets,
                  label: "Reserved",
                  stack: "profit",
                  color: "rgb(245,152,160)",
                },
                {
                  data: myChartData.profitFromGeneralAdmissionTickets,
                  label: "General Admission",
                  stack: "profit",
                  color: "rgb(151,118,109)",
                },
              ]}
              xAxis={[{ data: myChartData.playerLabels, scaleType: "band" }]}
            />
          </Stack>
        )}
        {tabValue === 1 && (
          <Stack direction="row" style={{ alignItems: "center" }}>
            {uiGameData.players.map((player, index) => (
              <>
                {index === 0 &&
                  GetChartFor(
                    myChartData.player1Data,
                    myChartData.player1MissedData,
                    player.name,
                    index,
                  )}
                {index === 1 &&
                  GetChartFor(
                    myChartData.player2Data,
                    myChartData.player2MissedData,
                    player.name,
                    index,
                  )}
                {index === 2 &&
                  GetChartFor(
                    myChartData.player3Data,
                    myChartData.player3MissedData,
                    player.name,
                    index,
                  )}
                {index === 3 &&
                  GetChartFor(
                    myChartData.player4Data,
                    myChartData.player4MissedData,
                    player.name,
                    index,
                  )}
              </>
            ))}
          </Stack>
        )}
      </Box>
      <Box sx={{ width: "100%", height: "100%", mt: 2 }}>
        <Leaderboard gameData={uiGameData} simData={simulationData} />
      </Box>
    </Stack>
  );
}
