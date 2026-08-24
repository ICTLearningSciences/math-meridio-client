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
  DANCE_PRICE,
  MUSIC_PRICE,
  TECH_PRICE,
  DANCE_PERCENT_KEY,
  MUSIC_PERCENT_KEY,
  TECH_PERCENT_KEY,
  TECH_CONVERSION_RATE,
  MUSIC_CONVERSION_RATE,
  DANCE_CONVERSION_RATE,
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

interface ChartData {
  profitFromDanceShorts: number[];
  profitFromMusicVideos: number[];
  profitFromTechVideos: number[];
  player1Data: number[];
  player1ViewData: number[];
  player2Data: number[];
  player2ViewData: number[];
  player3Data: number[];
  player3ViewData: number[];
  player4Data: number[];
  player4ViewData: number[];
  playerLabels: string[];
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
  const videosChartWidth = resultsWidth / uiGameData.players.length;
  const initialChartData: ChartData = {
    profitFromDanceShorts: [],
    profitFromMusicVideos: [],
    profitFromTechVideos: [],
    player1Data: [],
    player1ViewData: [],
    player2Data: [],
    player2ViewData: [],
    player3Data: [],
    player3ViewData: [],
    player4Data: [],
    player4ViewData: [],
    playerLabels: [],
  };
  const [myChartData, setMyChartData] = useState<ChartData>(initialChartData);
  const [tabValue, setTabValue] = useState(0);
  const labels = ["Dance Shorts", "Music Videos", "Tech Videos"];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  function GetChartFor(
    playerData: number[],
    playerMissedData: number[],
    playerName: string,
    index: number,
  ) {
    return (
      <Stack key={index} direction="column" style={{ alignItems: "center" }}>
        <BarChart
          width={videosChartWidth}
          height={chartHeight}
          series={[
            { data: playerData, label: "videos", stack: "profit" },
            {
              data: playerMissedData,
              label: "views",
              stack: "views",
            },
          ]}
          xAxis={[{ data: labels, scaleType: "band" }]}
        />
        <Typography variant="subtitle1">{playerName}</Typography>
      </Stack>
    );
  }

  React.useEffect(() => {
    const simulationData: Record<string, SocialMediaSimulationData> = {};
    for (const player of uiGameData.players) {
      const psd = uiGameData.playersGameStateData[player._id];
      const danceShorts = psd[DANCE_PERCENT_KEY] || 0;
      const musicVideos = psd[MUSIC_PERCENT_KEY] || 0;
      const techVideos = psd[TECH_PERCENT_KEY] || 0;
      const danceShortsViews = Math.round(
        danceShorts * DANCE_CONVERSION_RATE * 0.05,
      );
      const musicVideosViews = Math.round(
        musicVideos * MUSIC_CONVERSION_RATE * 0.05,
      );
      const techVideosViews = Math.round(
        techVideos * TECH_CONVERSION_RATE * 0.05,
      );
      const profit =
        (techVideosViews / 100000) * TECH_PRICE +
        (musicVideosViews / 100000) * MUSIC_PRICE +
        (danceShortsViews / 100000) * DANCE_PRICE;
      const simData: SocialMediaSimulationData = {
        player: player._id,
        playerAvatar: player,
        danceShorts: danceShorts,
        danceShortsViewed: danceShortsViews,
        musicVideos: musicVideos,
        musicVideosViewed: musicVideosViews,
        techVideos: techVideos,
        techVideosViewed: techVideosViews,
        totalProfit: profit,
      };
      simulationData[player._id] = simData;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSimulationData(simulationData);

    let player1Data: number[] = [];
    let player1ViewData: number[] = [];
    let player2Data: number[] = [];
    let player2ViewData: number[] = [];
    let player3Data: number[] = [];
    let player3ViewData: number[] = [];
    let player4Data: number[] = [];
    let player4ViewData: number[] = [];
    for (let index = 0; index < uiGameData.players.length; index++) {
      const player = uiGameData.players[index];
      const playerMade = [
        simulationData[player._id]?.danceShorts,
        simulationData[player._id]?.musicVideos,
        simulationData[player._id]?.techVideos,
      ];
      const playerViews = [
        simulationData[player._id]?.danceShortsViewed,
        simulationData[player._id]?.musicVideosViewed,
        simulationData[player._id]?.techVideosViewed,
      ];
      switch (index) {
        case 0:
          player1Data = playerMade;
          player1ViewData = playerViews;
          break;
        case 1:
          player2Data = playerMade;
          player2ViewData = playerViews;
          break;
        case 2:
          player3Data = playerMade;
          player3ViewData = playerViews;
          break;
        case 3:
          player4Data = playerMade;
          player4ViewData = playerViews;
          break;
      }
    }

    const playerLabels = uiGameData.players.map((player) => player.name);
    const chartData = {
      profitFromDanceShorts: uiGameData.players.map(
        (player) =>
          ((simulationData[player._id]?.danceShortsViewed || 0) / 100000) *
          DANCE_PRICE,
      ),
      profitFromMusicVideos: uiGameData.players.map(
        (player) =>
          ((simulationData[player._id]?.musicVideosViewed || 0) / 100000) *
          MUSIC_PRICE,
      ),
      profitFromTechVideos: uiGameData.players.map(
        (player) =>
          ((simulationData[player._id]?.techVideosViewed || 0) / 100000) *
          TECH_PRICE,
      ),
      player1Data,
      player1ViewData,
      player2Data,
      player2ViewData,
      player3Data,
      player3ViewData,
      player4Data,
      player4ViewData,
      playerLabels,
    };
    setMyChartData(chartData);
  }, [uiGameData.playersGameStateData, uiGameData.players]);

  return (
    <Stack
      direction="column"
      style={{ alignItems: "center", width: resultsWidth }}
    >
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Profits" />
        <Tab label="Views" />
      </Tabs>
      <Box sx={{ width: "100%", height: "100%", mt: 2 }}>
        {tabValue === 0 && (
          <Stack direction="column" style={{ alignItems: "center" }}>
            <BarChart
              width={scoreChartWidth}
              height={chartHeight}
              series={[
                {
                  data: myChartData.profitFromDanceShorts,
                  label: "Dance Shorts",
                  stack: "profit",
                  color: "rgb(150,221,242)",
                },
                {
                  data: myChartData.profitFromMusicVideos,
                  label: "Music Videos",
                  stack: "profit",
                  color: "rgb(245,152,160)",
                },
                {
                  data: myChartData.profitFromTechVideos,
                  label: "Tech Videos",
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
                    myChartData.player1ViewData,
                    player.name,
                    index,
                  )}
                {index === 1 &&
                  GetChartFor(
                    myChartData.player2Data,
                    myChartData.player2ViewData,
                    player.name,
                    index,
                  )}
                {index === 2 &&
                  GetChartFor(
                    myChartData.player3Data,
                    myChartData.player3ViewData,
                    player.name,
                    index,
                  )}
                {index === 3 &&
                  GetChartFor(
                    myChartData.player4Data,
                    myChartData.player4ViewData,
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
