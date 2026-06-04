/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from 'react';
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
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { ConcertTicketSalesSimulationData } from './SimulationScene';
import {
  VIP_TICKET_PRICE,
  RESERVED_TICKET_PRICE,
  GENERAL_ADMISSION_TICKET_PRICE,
  VIP_TICKET_PERCENT_KEY,
  RESERVED_TICKET_PERCENT_KEY,
  GENERAL_ADMISSION_TICKET_PERCENT_KEY,
  GENERAL_ADMISSION_TICKET_CONVERSION_RATE,
  RESERVED_TICKET_CONVERSION_RATE,
  VIP_TICKET_CONVERSION_RATE,
} from '.';
import { GameData } from '../../store/slices/game/types';
import AvatarSprite from '../../components/avatar-sprite';
import { EmojiEvents } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';

export function Leaderboard(props: {
  gameData: GameData;
  simData: Record<string, ConcertTicketSalesSimulationData>;
}): JSX.Element {
  const { gameData, simData } = props;
  const me = useAppSelector((state) => state.playerData.player);
  const data = Object.values(simData).sort(
    (a, b) => b.totalProfit - a.totalProfit
  );
  const topScore = data[0]?.totalProfit;

  return (
    <div className="column spacing">
      <Typography fontWeight="bold">Leaderboard</Typography>
      <List>
        {data.map((data, i) => {
          const player = gameData.players.find((p) => p._id === data.player);
          const isTop = data.totalProfit === topScore;
          const color = isTop ? 'gold' : i === 1 ? '#CD7F32' : '';
          return (
            <ListItem key={i} className="row">
              <ListItemAvatar
                className="row center-div spacing"
                style={{ marginRight: 10 }}
              >
                <Avatar sx={{ width: 24, height: 24, backgroundColor: color }}>
                  <Typography fontSize={12}>{i + 1}</Typography>
                </Avatar>
                <AvatarSprite bgColor={'rgb(217, 217, 217)'} player={player} />
              </ListItemAvatar>
              <div style={{ flexGrow: 1, marginRight: 5 }}>
                <Typography fontWeight="bold">
                  {player?.name} {me?._id === player?._id ? ' (Me) ' : ''}
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
                sx={{ color: color, visibility: isTop ? '' : 'hidden' }}
              />
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}

export function ResultComponent(props: { uiGameData: GameData }): JSX.Element {
  const { uiGameData } = props;
  const [simulationData, setSimulationData] = React.useState<
    Record<string, ConcertTicketSalesSimulationData>
  >({});

  const chartHeight = 300;
  const resultsWidth = window.innerWidth / 2 - 100;
  const scoreChartWidth = resultsWidth;
  const ticketsChartWidth = resultsWidth / uiGameData.players.length;

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

  const ticketLabels = ['VIP', 'Reserved', 'General Admission'];

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  function simulationEnded(data: ConcertTicketSalesSimulationData): void {
    simulationData[data.player] = data;
    setSimulationData({ ...simulationData });
    let profitFromVipTickets: number[] = [];
    let profitFromReservedTickets: number[] = [];
    let profitFromGeneralAdmissionTickets: number[] = [];

    let player1Data: number[] = [];
    let player1MissedData: number[] = [];

    let player2Data: number[] = [];
    let player2MissedData: number[] = [];

    let player3Data: number[] = [];
    let player3MissedData: number[] = [];

    let player4Data: number[] = [];
    let player4MissedData: number[] = [];

    let playerLabels: string[] = [];

    for (let index = 0; index < uiGameData.players.length; index++) {
      const player = uiGameData.players[index];
      const playerMade = [
        simulationData[player._id]?.vipTicketsSold,
        simulationData[player._id]?.reservedTicketsSold,
        simulationData[player._id]?.generalAdmissionTicketsSold,
      ];
      const playerMissed = [
        simulationData[player._id]?.vipTicketsUpForSale -
          simulationData[player._id]?.vipTicketsSold,
        simulationData[player._id]?.reservedTicketsUpForSale -
          simulationData[player._id]?.reservedTicketsSold,
        simulationData[player._id]?.generalAdmissionTicketsUpForSale -
          simulationData[player._id]?.generalAdmissionTicketsSold,
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
    profitFromVipTickets = uiGameData.players.map(
      (player) =>
        (simulationData[player._id]?.vipTicketsSold || 0) * VIP_TICKET_PRICE
    );

    profitFromReservedTickets = uiGameData.players.map(
      (player) =>
        (simulationData[player._id]?.reservedTicketsSold || 0) *
        RESERVED_TICKET_PRICE
    );

    profitFromGeneralAdmissionTickets = uiGameData.players.map(
      (player) =>
        (simulationData[player._id]?.generalAdmissionTicketsSold || 0) *
        GENERAL_ADMISSION_TICKET_PRICE
    );
    playerLabels = uiGameData.players.map((player) => player.name);
    setMyChartData({
      profitFromVipTickets: profitFromVipTickets,
      profitFromReservedTickets: profitFromReservedTickets,
      profitFromGeneralAdmissionTickets: profitFromGeneralAdmissionTickets,
      player1Data: player1Data,
      player1MissedData: player1MissedData,
      player2Data: player2Data,
      player2MissedData: player2MissedData,
      player3Data: player3Data,
      player3MissedData: player3MissedData,
      player4Data: player4Data,
      player4MissedData: player4MissedData,
      playerLabels: playerLabels,
    });
  }

  function GetChartFor(
    playerData: number[],
    playerMissedData: number[],
    playerName: string,
    bHideLegend: boolean,
    index: number
  ) {
    return (
      <Stack key={index} direction="column" alignItems="center">
        <BarChart
          barLabel="value"
          width={ticketsChartWidth}
          height={chartHeight}
          series={[
            { data: playerData, label: 'sold', stack: 'tickets' },
            {
              data: playerMissedData,
              label: 'unsold',
              stack: 'tickets',
            },
          ]}
          slotProps={{ legend: { hidden: bHideLegend } }}
          xAxis={[{ data: ticketLabels, scaleType: 'band' }]}
        />
        <Typography variant="subtitle1">{playerName}</Typography>
      </Stack>
    );
  }

  React.useEffect(() => {
    for (const player of props.uiGameData.players) {
      const psd = props.uiGameData.playersGameStateData[player._id];
      const vipTicketsUpForSale = psd[VIP_TICKET_PERCENT_KEY] || 0;
      const reservedTicketsUpForSale = psd[RESERVED_TICKET_PERCENT_KEY] || 0;
      const generalAdmissionTicketsUpForSale =
        psd[GENERAL_ADMISSION_TICKET_PERCENT_KEY] || 0;
      const generalAdmissionTicketsSold = Math.round(
        generalAdmissionTicketsUpForSale *
          GENERAL_ADMISSION_TICKET_CONVERSION_RATE
      );
      const reservedTicketsSold = Math.round(
        reservedTicketsUpForSale * RESERVED_TICKET_CONVERSION_RATE
      );
      const vipTicketsSold = Math.round(
        vipTicketsUpForSale * VIP_TICKET_CONVERSION_RATE
      );
      const total =
        generalAdmissionTicketsSold * GENERAL_ADMISSION_TICKET_PRICE +
        reservedTicketsSold * RESERVED_TICKET_PRICE +
        vipTicketsSold * VIP_TICKET_PRICE;
      const simData: ConcertTicketSalesSimulationData = {
        player: player._id,
        playerAvatar: player,
        generalAdmissionTicketsUpForSale: generalAdmissionTicketsUpForSale,
        generalAdmissionTicketsSold,
        reservedTicketsUpForSale: reservedTicketsUpForSale,
        reservedTicketsSold,
        vipTicketsUpForSale: vipTicketsUpForSale,
        vipTicketsSold,
        totalProfit: total,
      };
      simulationEnded(simData);
    }
  }, [props.uiGameData.playersGameStateData, props.uiGameData.players]);

  return (
    <Stack
      sx={{ width: resultsWidth }}
      direction="column"
      alignItems="center"
      width={resultsWidth}
    >
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Profits" />
        <Tab label="Tickets Sold" />
      </Tabs>
      <Box sx={{ width: '100%', height: '100%', mt: 2 }}>
        {tabValue === 0 && (
          <Stack direction="column" alignItems="center">
            <BarChart
              barLabel="value"
              width={scoreChartWidth}
              height={chartHeight}
              series={[
                {
                  data: myChartData.profitFromVipTickets,
                  label: 'VIP',
                  stack: 'profit',
                  color: 'rgb(150,221,242)',
                },
                {
                  data: myChartData.profitFromReservedTickets,
                  label: 'Reserved',
                  stack: 'profit',
                  color: 'rgb(245,152,160)',
                },
                {
                  data: myChartData.profitFromGeneralAdmissionTickets,
                  label: 'General Admission',
                  stack: 'profit',
                  color: 'rgb(151,118,109)',
                },
              ]}
              xAxis={[{ data: myChartData.playerLabels, scaleType: 'band' }]}
            />
          </Stack>
        )}
        {tabValue === 1 && (
          <Stack direction="row" alignItems="center">
            {uiGameData.players.map((player, index) => (
              <>
                {index === 0 &&
                  GetChartFor(
                    myChartData.player1Data,
                    myChartData.player1MissedData,
                    player.name,
                    true,
                    index
                  )}
                {index === 1 &&
                  GetChartFor(
                    myChartData.player2Data,
                    myChartData.player2MissedData,
                    player.name,
                    true,
                    index
                  )}
                {index === 2 &&
                  GetChartFor(
                    myChartData.player3Data,
                    myChartData.player3MissedData,
                    player.name,
                    true,
                    index
                  )}
                {index === 3 &&
                  GetChartFor(
                    myChartData.player4Data,
                    myChartData.player4MissedData,
                    player.name,
                    true,
                    index
                  )}
              </>
            ))}
          </Stack>
        )}
      </Box>
      <Box sx={{ width: '100%', height: '100%', mt: 2 }}>
        <Leaderboard gameData={uiGameData} simData={simulationData} />
      </Box>
    </Stack>
  );
}
