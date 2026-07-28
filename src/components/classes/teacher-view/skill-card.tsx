/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { type Word, WordCloud } from "@isoterik/react-word-cloud";
import {
  BackHand,
  CheckCircle,
  DoDisturb,
  ExpandLess,
  ExpandMore,
  Person,
} from "@mui/icons-material";
import {
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { BarChart, PieChart } from "@mui/x-charts";

import AvatarSprite, { PlayerSprite } from "../../avatar-sprite";
import type { Room } from "../../../store/slices/game/types";
import { type Player } from "../../../store/slices/player/types";
import { calculateAverage, calculateSum } from "../../../helpers";
import type { GenericLlmRequest, SkillsMet } from "../../../types";
import { jsonLlmRequest } from "../../../classes/api-helpers";
import { useWithConfig } from "../../../store/slices/config/use-with-config";
import ChatThread from "../../game/chat-thread";
import { Link } from "react-router-dom";
import { GAMES } from "../../../game/types";
import { useWithEducationalData } from "../../../store/slices/educational-data/use-with-educational-data";

export interface PlayerPhaseMetrics {
  player: Player;
  room: Room;
  timeSpent: number;
  numWordsSent: number;
  totalWordsSent: number;
  contribution: number;
}

export function Contribution(props: {
  students: Player[];
  gameRooms: Room[];
  phase?: number;
}): React.ReactNode {
  const { gameRooms, phase } = props;
  const [metrics, setMetrics] = React.useState<PlayerPhaseMetrics[]>([]);

  React.useEffect(() => {
    const metrics: PlayerPhaseMetrics[] = [];
    for (const room of gameRooms) {
      for (const student of room.gameData.players) {
        const playerStatus = room.gameData.playersStatusRecord[student._id];
        if (!playerStatus) continue;
        const playerMetrics: PlayerPhaseMetrics = {
          player: student,
          room: room,
          timeSpent: 0,
          numWordsSent: 0,
          totalWordsSent: 0,
          contribution: 0,
        };
        const phases =
          phase === undefined
            ? room.gameData.phaseProgression.phasesCompleted
            : [room.gameData.phaseProgression.phasesCompleted[phase]];
        for (const p of phases) {
          if (!playerStatus.phaseMetrics || !playerStatus.phaseMetrics[p]) {
            continue;
          }
          playerMetrics.timeSpent +=
            playerStatus.phaseMetrics[p]?.timeSpentInPhase || 0;
          playerMetrics.numWordsSent +=
            playerStatus.phaseMetrics[p]?.numWordsSentInPhase || 0;
        }
        playerMetrics.timeSpent = Math.round(playerMetrics.timeSpent / 60);
        metrics.push(playerMetrics);
      }
    }
    for (const metric of metrics) {
      metric.totalWordsSent = calculateSum(
        metrics
          .filter((m) => m.room._id === metric.room._id)
          .map((m) => m.numWordsSent),
      );
      if (metric.totalWordsSent > 0) {
        metric.contribution = Math.round(
          100 * (metric.numWordsSent / metric.totalWordsSent),
        );
      }
    }
    setMetrics(metrics);
  }, [gameRooms, phase]);

  return (
    <div>
      <Typography style={{ fontSize: 14, fontWeight: "bold" }}>
        {gameRooms.length === 1
          ? "Student Contribution"
          : "Average Student Contribution"}
      </Typography>
      <div
        className="row center-div"
        style={{
          border: "1px solid black",
          borderRadius: 10,
          marginTop: 10,
        }}
      >
        <BarChart
          height={200}
          yAxis={[{ label: "Frequency" }]}
          series={metrics.map((c) => ({
            data: c.numWordsSent > 0 ? [c.numWordsSent] : [],
            label: c.player.name,
            stack: c.room._id,
            valueFormatter: (v) => `${v} words`,
          }))}
        />
      </div>
    </div>
  );
}

export function TimeSpent(props: {
  gameRooms: Room[];
  phase?: number;
}): React.ReactNode {
  const { gameRooms, phase } = props;
  const [metrics, setMetrics] = React.useState<PlayerPhaseMetrics[]>([]);

  React.useEffect(() => {
    const metrics: PlayerPhaseMetrics[] = [];
    for (const room of gameRooms) {
      for (const student of room.gameData.players) {
        const playerStatus = room.gameData.playersStatusRecord[student._id];
        if (!playerStatus) continue;
        const playerMetrics: PlayerPhaseMetrics = {
          player: student,
          room: room,
          timeSpent: 0,
          numWordsSent: 0,
          totalWordsSent: 0,
          contribution: 0,
        };
        const phases =
          phase === undefined
            ? room.gameData.phaseProgression.phasesCompleted
            : [room.gameData.phaseProgression.phasesCompleted[phase]];
        for (const p of phases) {
          if (!playerStatus.phaseMetrics || !playerStatus.phaseMetrics[p]) {
            continue;
          }
          playerMetrics.timeSpent +=
            playerStatus.phaseMetrics[p]?.timeSpentInPhase || 0;
          playerMetrics.numWordsSent +=
            playerStatus.phaseMetrics[p]?.numWordsSentInPhase || 0;
        }
        playerMetrics.timeSpent = Math.round(playerMetrics.timeSpent / 60);
        metrics.push(playerMetrics);
      }
    }
    setMetrics(metrics);
  }, [gameRooms, phase]);

  return (
    <div>
      <Typography style={{ fontSize: 14, fontWeight: "bold" }}>
        {gameRooms.length === 1 ? "Time Spent in Game" : "Average Time Spent"}
      </Typography>
      <div
        className="row center-div spacing"
        style={{
          border: "1px solid black",
          borderRadius: 10,
          marginTop: 10,
        }}
      >
        <div className="column center-div">
          <Typography style={{ fontSize: 12, fontWeight: "light" }}>
            {gameRooms.length === 1 ? "Total" : "Avg"} Time
          </Typography>
          <Typography variant="h3" style={{ fontWeight: "bold" }}>
            {gameRooms.length === 1
              ? calculateSum(metrics.map((c) => c.timeSpent))
              : Math.round(calculateAverage(metrics.map((c) => c.timeSpent)))}
          </Typography>
          <Typography>Minutes</Typography>
        </div>
        <div style={{ width: 110 }}>
          <PieChart
            series={[
              {
                data: metrics.map((p) => ({
                  id: p.player._id,
                  value: p.timeSpent,
                  label: p.player.name,
                })),
              },
            ]}
            width={200}
            height={200}
          />
        </div>
      </div>
    </div>
  );
}

export function ChatLog(props: {
  gameRoom: Room;
  phase?: number;
}): React.ReactNode {
  const { gameRoom, phase } = props;
  const messages = gameRoom.gameData.chat.filter(
    (c) =>
      phase === undefined ||
      c.phaseId === gameRoom.gameData.phaseProgression.phasesStarted[phase],
  );

  return (
    <div>
      <Typography
        style={{ marginBottom: 10, fontWeight: "bold", fontSize: 14 }}
      >
        Chat Log
      </Typography>
      {messages.length === 0 ? (
        <Card style={{ backgroundColor: "rgb(231, 231, 231)" }} elevation={0}>
          <CardContent className="column spacing">
            <Typography style={{ fontSize: 14 }}>
              {" "}
              No messages for this phase
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <ChatThread
          roomIsProcessing={gameRoom.phase === "PROCESSING"}
          requestUserInputPhaseData={gameRoom.gameData.curGameState}
          uiGameData={gameRoom.gameData}
          messages={messages}
          height={500}
        />
      )}
    </div>
  );
}

export function KeyWords(props: {
  gameRooms: Room[];
  phase?: number;
  category?: string;
}): React.ReactNode {
  const { gameRooms, phase } = props;
  const [loading, setLoading] = React.useState<boolean>(false);
  const [keywords, setKeywords] = React.useState<Word[]>();
  const [messages, setMessages] = React.useState<string[]>();
  const { firstAvailableAzureServiceModel } = useWithConfig();

  React.useEffect(() => {
    const msgs: string[] = [];
    for (const room of gameRooms) {
      for (const chat of room.gameData.chat.filter(
        (c) =>
          c.sender === "PLAYER" &&
          (phase === undefined ||
            c.phaseId === room.gameData.phaseProgression.phasesStarted[phase]),
      )) {
        msgs.push(chat.message.toLowerCase().trim());
      }
    }
    if (messages?.join("") !== msgs.join("")) {
      setMessages(msgs);
    }
  }, [gameRooms, phase]);

  React.useEffect(() => {
    if (!messages || messages.length === 0) return;
    setLoading(true);
    requestKeyWords(messages, props.category || "Math Good")
      .then((data) => {
        const keywords: Word[] = [];
        const words = messages.join(" ").replace(/\W /g, "").split(" ");
        for (const word of data) {
          const frequency = words.filter((w) => w === word).length;
          if (frequency > 0) {
            keywords.push({
              text: word,
              value: frequency * 200,
            });
          }
        }
        setKeywords(keywords);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [messages, props.category]);

  async function requestKeyWords(
    reflections: string[],
    category: string,
  ): Promise<string[]> {
    try {
      const request: GenericLlmRequest = {
        prompts: [
          {
            promptText: JSON.stringify(reflections),
            promptRole: "user",
          },
          {
            promptText: `Based on the following category, pick frequently used words to add from the sentences above. The items you pick should be relevant to the category.`,
            promptRole: "user",
          },
          {
            promptText: category,
            promptRole: "user",
          },
        ],
        targetAiServiceModel: firstAvailableAzureServiceModel(),
        outputDataType: "JSON",
        responseFormat: `
              Please only respond in an array of strings in JSON.
              Validate that your response is in valid JSON.
              Respond in this format:
                [
                    "string"
                ]
            `,
      };
      const res = await jsonLlmRequest<string[]>(request, {
        type: "array",
        items: {
          type: "string",
        },
        required: [],
      });
      return res;
    } catch (err) {
      return [];
    }
  }

  return (
    <div>
      <Typography style={{ fontSize: 14, fontWeight: "bold" }}>
        Key Words
      </Typography>
      <div
        className="row center-div"
        style={{
          height: 180,
          border: "1px solid black",
          borderRadius: 10,
          padding: 10,
          marginTop: 10,
        }}
      >
        {!loading && keywords ? (
          <WordCloud
            words={keywords}
            width={300}
            height={100}
            rotate={() => 0}
          />
        ) : (
          <CircularProgress />
        )}
      </div>
    </div>
  );
}

export function TroubleSpots(props: {
  students: Player[];
  gameRooms: Room[];
  noHeader?: boolean;
}): React.ReactNode {
  const { students, gameRooms } = props;
  const [expanded, setExpanded] = React.useState<boolean>(true);
  const [skills, setSkills] = React.useState<Record<string, SkillsMet>>({});

  React.useEffect(() => {
    const skills: Record<string, SkillsMet> = {};
    for (const student of students) {
      const room = gameRooms.find((r) =>
        r.gameData.players.find((p) => p._id === student._id),
      );
      if (room) {
        for (const standard of Object.entries(
          room.gameData.mathStandardsCompleted,
        )) {
          if (!(standard[0] in skills)) {
            skills[standard[0]] = { playersMet: [], players: [] };
          }
          if (standard[1]) {
            skills[standard[0]].playersMet.push(student);
          }
          skills[standard[0]].players.push(student);
        }
      }
    }
    setSkills(skills);
  }, [students, gameRooms]);

  return (
    <div>
      {!props.noHeader && (
        <Typography style={{ fontSize: 14, fontWeight: "bold" }}>
          Trouble Spots
        </Typography>
      )}
      <Grid container spacing={2}>
        <Grid size={12}>
          <Card
            style={{ backgroundColor: "rgb(231, 231, 231)", borderRadius: 10 }}
            elevation={0}
          >
            <CardContent className="column spacing">
              <div className="row center-div spacing">
                {expanded ? <ExpandLess /> : <ExpandMore />}
                <Typography
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    flexGrow: 1,
                  }}
                  onClick={() => setExpanded(!expanded)}
                >
                  Challenge Sections
                </Typography>
              </div>
              <Collapse in={expanded}>
                <div className="column spacing">
                  {Object.entries(skills)
                    .sort((a, b) => {
                      return b[1].playersMet.length - a[1].playersMet.length;
                    })
                    .filter(
                      (skill) =>
                        skill[1].playersMet.length < skill[1].players.length,
                    )
                    .map((skill) => {
                      return (
                        <SkillCard
                          key={skill[0]}
                          name={skill[0]}
                          players={skill[1].players}
                          playersMet={skill[1].playersMet}
                        />
                      );
                    })}
                </div>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export function NeedsHelp(props: {
  students: Player[];
  gameRooms: Room[];
}): React.ReactNode {
  const { gameRooms } = props;
  const { dismissPlayerNeedsHelpInRoom } = useWithEducationalData();

  const studentsNeedHelp = gameRooms.reduce((students: Player[], room) => {
    for (const student of room.gameData.players) {
      if (room.gameData.playersStatusRecord[student._id].needsHelpInRoom) {
        students.push(student);
      }
    }
    return students;
  }, []);

  if (!studentsNeedHelp.length) return <div />;
  return (
    <Card
      style={{ backgroundColor: "rgb(231, 231, 231)", borderRadius: 10 }}
      elevation={0}
    >
      <CardContent className="column spacing">
        <Typography style={{ fontSize: 14, fontWeight: "bold" }}>
          Requested Help
        </Typography>
        {studentsNeedHelp.map((p) => {
          const room = gameRooms.find(
            (r) => r.gameData.playersStatusRecord[p._id],
          );
          if (!room) return <div key={p._id} />;
          return (
            <Card
              key={p._id}
              className="row center-div"
              style={{
                justifyContent: "space-between",
                backgroundColor: "white",
                paddingRight: 20,
              }}
              elevation={0}
            >
              <div className="row center-div">
                <AvatarSprite player={p} />
                <Typography>{p.name}</Typography>
              </div>
              <Link to={`/classes/${room.classId}/room/${room._id}`}>
                {room.name}
              </Link>
              <Typography>
                {GAMES.find((g) => g.id === room.gameData.gameId)?.name}: Phase{" "}
                {room?.gameData.phaseProgression.phasesCompleted.length + 1}
              </Typography>
              <Tooltip title="Dismiss Help Request">
                <IconButton
                  onClick={() => dismissPlayerNeedsHelpInRoom(room._id, p._id)}
                  style={{ color: "black" }}
                >
                  <BackHand />
                  <div
                    className="row center-div"
                    style={{ color: "red", position: "absolute", right: 1 }}
                  >
                    <DoDisturb fontSize="large" />
                  </div>
                </IconButton>
              </Tooltip>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function SkillsPracticed(props: {
  students: Player[];
  gameRooms: Room[];
  noHeader?: boolean;
}): React.ReactNode {
  const { students, gameRooms } = props;
  const [skills, setSkills] = React.useState<Record<string, SkillsMet>>({});
  const [expanded, setExpanded] = React.useState<boolean>(true);

  const skillsMet = Object.entries(skills)
    .sort((a, b) => {
      return b[1].playersMet.length - a[1].playersMet.length;
    })
    .filter((skill) => skill[1].playersMet.length === skill[1].players.length);

  React.useEffect(() => {
    const skills: Record<string, SkillsMet> = {};
    for (const student of students) {
      const room = gameRooms.find((r) =>
        r.gameData.players.find((p) => p._id === student._id),
      );
      if (room) {
        for (const standard of Object.entries(
          room.gameData.mathStandardsCompleted,
        )) {
          if (!(standard[0] in skills)) {
            skills[standard[0]] = { playersMet: [], players: [] };
          }
          if (standard[1]) {
            skills[standard[0]].playersMet.push(student);
          }
          skills[standard[0]].players.push(student);
        }
      }
    }
    setSkills(skills);
  }, [students, gameRooms]);

  return (
    <Card
      style={{ backgroundColor: "rgb(231, 231, 231)", borderRadius: 10 }}
      elevation={0}
    >
      <CardContent className="column spacing">
        {!props.noHeader && (
          <div className="row center-div spacing">
            {expanded ? <ExpandLess /> : <ExpandMore />}
            <Typography
              style={{
                fontSize: 14,
                fontWeight: "bold",
                flexGrow: 1,
              }}
              onClick={() => setExpanded(!expanded)}
            >
              Skills Practiced
            </Typography>
          </div>
        )}
        {skillsMet.length === 0 && (
          <Typography style={{ textAlign: "center" }}>
            No skills have been mastered yet.
          </Typography>
        )}
        <Collapse in={expanded}>
          <div className="column spacing">
            {skillsMet.map((skill) => {
              return (
                <SkillCard
                  key={skill[0]}
                  name={skill[0]}
                  players={skill[1].players}
                  playersMet={skill[1].playersMet}
                />
              );
            })}
          </div>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default function SkillCard(props: {
  name: string;
  players: Player[];
  playersMet: Player[];
}): React.ReactNode {
  const { players, playersMet } = props;
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const percentMet = playersMet.length / players.length;

  return (
    <div
      style={{
        borderRadius: 10,
        backgroundColor: "white",
      }}
    >
      <div className="row card spacing" onClick={() => setExpanded(!expanded)}>
        <Typography style={{ flexGrow: 1 }}>{props.name}</Typography>
        <Person
          fontSize="small"
          color={percentMet === 1 ? "success" : "inherit"}
        />
        <Typography color={percentMet === 1 ? "green" : ""}>
          {playersMet.length} / {players.length}
        </Typography>
      </div>
      <Collapse in={expanded}>
        <div className="row spacing" style={{ marginLeft: 20 }}>
          {players.map((p) => {
            const isMet = playersMet.find((s) => s._id === p._id);
            return (
              <PlayerSprite key={p._id} player={p}>
                {isMet && (
                  <CheckCircle
                    color="success"
                    fontSize="small"
                    style={{
                      position: "absolute",
                      bottom: 20,
                      right: 0,
                    }}
                  />
                )}
              </PlayerSprite>
            );
          })}
        </div>
      </Collapse>
    </div>
  );
}
