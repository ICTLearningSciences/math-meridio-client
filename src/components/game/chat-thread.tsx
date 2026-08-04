/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { makeStyles } from "tss-react/mui";
import {
  Avatar,
  type AvatarProps,
  Box,
  Paper,
  Stack,
  styled,
  Typography,
} from "@mui/material";

import { useAppSelector } from "../../store/hooks";
import type { ChatMessage, GameData } from "../../store/slices/game/types";
import AvatarSprite from "../avatar-sprite";
import type { CurGameState } from "../discussion-stage-builder/types";
import WaitingForPlayers from "./waiting-for-players";
import type { Player } from "../../store/slices/player/types";
import { ProcessingIndicator } from "./processing-indicator";
import { useAnimatedMessages } from "./use-animated-messages";
import type { UseWithEducationalData } from "../../store/slices/educational-data/use-with-educational-data";

export type PlayerChatColors =
  | "info.main"
  | "success.main"
  | "warning.main"
  | "secondary.main"
  | "text.secondary"
  | "error.main";

const useStyles = makeStyles()(() => ({
  chatThread: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    overflowY: "auto",
    spacing: 3,
  },
  chatItem: {
    position: "relative",
    flexDirection: "row",
    borderRadius: 30,
    alignItems: "center",
    fontFamily: "Helvetica, Arial, sans-serif",
    textAlign: "left",
    "&.mine": {
      alignSelf: "flex-end",
      backgroundColor: "#0084ff",
      borderBottomRightRadius: 5,
      "&:after": {
        content: '""',
        display: "block",
        position: "absolute",
        right: -15,
        bottom: -15,
        transform: "rotate(270deg)",
        borderStyle: "solid",
        borderWidth: "30px 0 0 30px",
        borderColor: "#0084ff transparent",
        borderRadius: "0 0 40px 0",
      },
    },
    "&.other": {
      alignSelf: "flex-start",
      backgroundColor: "#e6e6e6",
      borderBottomLeftRadius: 5,
      "&:after": {
        content: '""',
        display: "block",
        position: "absolute",
        left: 0,
        bottom: -5,
        transform: "rotate(-140deg)",
        borderStyle: "solid",
        borderWidth: "30px 0 0 30px",
        borderColor: "#e6e6e6 transparent",
        borderRadius: "0 0 40px 0",
      },
      "&.PLAYER": {
        backgroundColor: "#d2eafe",
        "&:after": {
          borderColor: "#d2eafe transparent",
        },
      },
    },
  },
}));

export default function ChatThread(props: {
  roomIsProcessing: boolean;
  requestUserInputPhaseData: CurGameState;
  uiGameData: GameData;
  messages?: ChatMessage[];
  height?: number;
}): React.ReactNode {
  const { roomIsProcessing, requestUserInputPhaseData, uiGameData } = props;
  const { reportPlayerAway } = useOutletContext<UseWithEducationalData>();

  const { classes } = useStyles();
  const { player } = useAppSelector((state) => state.playerData);
  const isTeacher = player?.educationalRole === "INSTRUCTOR";
  const allMessages = props.messages || uiGameData.chat || [];
  const { displayedMessages, isAnimating } = useAnimatedMessages(allMessages);
  const messages = displayedMessages.filter((msg) => msg.message);
  const players = uiGameData.players;
  const playersBeingWaitedFor =
    requestUserInputPhaseData.playersLeftToRespond.reduce((acc, id) => {
      const player = players?.find((p) => p._id === id);
      if (player) {
        acc.push(player);
      }
      return acc;
    }, [] as Player[]);
  const isInRequestUserInputState =
    requestUserInputPhaseData.curState === "ALL_REQUIRED_IN_ORDER" ||
    requestUserInputPhaseData.curState === "SINGLE_RESPONSE_REQUIRED" ||
    requestUserInputPhaseData.curState ===
      "ALL_USER_RESPONSES_REQUIRED_FREE_FOR_ALL";

  // Track when request user input state starts for the 60-second timer
  const [requestInputStartTime, setRequestInputStartTime] = useState<
    number | null
  >(null);
  const previousIsInRequestUserInputState = useRef(false);

  useEffect(() => {
    // If it just became true, record the start time
    if (
      isInRequestUserInputState &&
      !previousIsInRequestUserInputState.current
    ) {
      console.log("ChatThread: Request user input state started");
      setRequestInputStartTime(Date.now());
    }

    // If it just became false, clear the start time
    if (
      !isInRequestUserInputState &&
      previousIsInRequestUserInputState.current
    ) {
      console.log("ChatThread: Request user input state ended");
      setRequestInputStartTime(null);
    }

    previousIsInRequestUserInputState.current = isInRequestUserInputState;
  }, [isInRequestUserInputState]);

  const playerColorMap: Map<string, string> = new Map([]);

  const usedColors: Map<string, boolean> = new Map([
    ["green", false],
    ["blue", false],
    ["purple", false],
  ]);
  //setting only 3 colors as we have 4 players max. Blue is reserved for Self and Grey is for System.

  const GetUnusedColor = (): string => {
    let retColor = "error.main".toString();
    for (const myKey of usedColors.keys()) {
      if (usedColors.get(myKey) == false) {
        usedColors.set(myKey, true);
        retColor = myKey;
        break;
      }
    }
    return retColor;
  };

  const GetMyColor = (id: string, isPlayer: boolean): string => {
    if (id != "") {
      if (!(id in playerColorMap)) {
        if (isPlayer) {
          playerColorMap.set(id, "info.main");
        } else {
          const unusedColor = GetUnusedColor();
          playerColorMap.set(id, unusedColor);
        }
      }
      return playerColorMap.get(id) as string;
    }

    return "error.main";
  };

  const BorderedAvatar = styled(Avatar)`
    border: 3px solid lightseagreen;
  `;

  const stringAvatar = (name: string, id: string): AvatarProps => {
    if (!name) {
      return {
        alt: "System",

        sx: {
          bgcolor: "text.secondary",
        },
        children: "S",
      };
    }
    if (name.split(" ").length > 1) {
      return {
        alt: name,
        sx: {
          bgcolor: playerColorMap.get(id),
        },
        children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
      };
    } else {
      return {
        alt: name,
        sx: {
          bgcolor: playerColorMap.get(id),
        },
        children: `${name.split(" ")[0][0]}`,
      };
    }
  };

  players?.forEach((iterPlayer: { _id: string }) => {
    GetMyColor(iterPlayer._id, iterPlayer._id == player?._id);
  });

  React.useEffect(() => {
    const objDiv = document.getElementById("chat-thread");
    if (objDiv) {
      objDiv.scroll({
        top: objDiv.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  let prevMessageOwner = "";
  let currMessageOwner = "";
  let skipAvatar = false;
  return (
    <div
      id="chat-thread"
      className={classes.chatThread}
      style={{
        backgroundColor: "text.secondary",
        maxHeight: props.height || window.innerHeight - 250,
      }}
    >
      <Stack direction="column">
        {messages.map((msg, idx) => {
          const teacherMessage = msg.sender === "INSTRUCTOR";
          const myMessage =
            msg.sender === "PLAYER" && msg.senderId === player?._id;

          if (msg.sender == "SYSTEM") {
            // eslint-disable-next-line react-hooks/immutability
            currMessageOwner = "System";
          } else {
            currMessageOwner = msg.senderId ?? "";
          }
          if (prevMessageOwner == currMessageOwner) {
            skipAvatar = true;
          } else {
            skipAvatar = false;
            prevMessageOwner = currMessageOwner;
          }
          const bubbleColor = teacherMessage
            ? "white"
            : msg.sender === "PLAYER"
              ? playerColorMap.get(msg.senderId ?? "")
              : "text.secondary";

          return (
            <Stack key={`chat-msg-container-${idx}`} direction="column">
              {!skipAvatar && (
                <Typography
                  style={{
                    textAlign: !myMessage ? "left" : "right",
                    color: "teal",
                  }}
                >
                  {teacherMessage
                    ? "Instructor"
                    : msg.sender === "PLAYER"
                      ? msg.senderId === player?._id
                        ? "You"
                        : msg.senderName
                      : "System"}
                </Typography>
              )}

              <Stack
                style={{
                  padding: 1,
                  flexDirection: !myMessage ? "row" : "row-reverse",
                  justifyContent: !myMessage ? "left" : "right",
                }}
              >
                {!skipAvatar &&
                  (msg.sender === "PLAYER" ? (
                    <AvatarSprite
                      player={players?.find((p) => p._id === msg.senderId)}
                      bgColor={bubbleColor}
                    />
                  ) : (
                    <BorderedAvatar
                      {...stringAvatar(
                        msg.senderName ?? "",
                        msg.senderId ?? "",
                      )}
                    ></BorderedAvatar>
                  ))}
                {skipAvatar && (
                  <Box
                    style={{
                      flexGrow: 0,
                      flexShrink: 0,
                      width: 46,
                    }}
                  ></Box>
                )}
                <Paper
                  square
                  elevation={0}
                  sx={{
                    p: 3,
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                    backgroundColor: bubbleColor,
                    paddingLeft: !myMessage ? "10%" : "5%",
                    paddingRight: !myMessage ? "5%" : "10%",
                    clipPath: !myMessage
                      ? "polygon(0% 0%, 100% 0%, 100% 100%, calc(0% + 1em) 100%, calc(0% + 1em) calc(0% + 1em), 0% 0%)"
                      : "polygon(0% 0%, 100% 0%, calc(100% - 1em) calc(0% + 1em), calc(100% - 1em) 100%, 0% 100%, 0% 0%)",
                    borderBottomLeftRadius: !myMessage ? 0 : "1em",
                    borderTopLeftRadius: !myMessage ? 0 : "1em",
                    borderBottomRightRadius: !myMessage ? "1em" : 0,
                    borderTopRightRadius: !myMessage ? "1em" : 0,
                  }}
                >
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      margin: 0,
                      fontFamily: "inherit",
                    }}
                  >
                    <Typography
                      style={{ color: teacherMessage ? "black" : "white" }}
                    >
                      {msg.message}
                    </Typography>
                  </pre>
                </Paper>
              </Stack>
            </Stack>
          );
        })}
        {!isTeacher && (roomIsProcessing || isAnimating) && (
          <ProcessingIndicator />
        )}
        {!isTeacher && (
          <WaitingForPlayers
            reportPlayerAway={reportPlayerAway}
            numPlayersInRoom={players?.length || 0}
            playersBeingWaitedFor={playersBeingWaitedFor || []}
            currentPlayerId={player?._id}
            isInRequestUserInputState={isInRequestUserInputState}
            requestUserInputPhaseData={requestUserInputPhaseData}
            roomIsProcessing={roomIsProcessing}
            requestInputStartTime={requestInputStartTime}
          />
        )}
      </Stack>
    </div>
  );
}
