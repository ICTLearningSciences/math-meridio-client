/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";

import EventSystem from "../game/event-system";
import ChatForm from "./game/chat-form";
import AvatarCreator from "../game/avatar";
import { useWithPhaserGame } from "../hooks/use-with-phaser-game";
import { useAppSelector } from "../store/hooks";
import {
  type Avatars,
  useWithPlayer,
} from "../store/slices/player/use-with-player-state";
import withAuthorizationOnly from "../wrap-with-authorization-only";

function AvatarPage(): React.ReactNode {
  const { player, loginStatus, saveStatus } = useAppSelector(
    (state) => state.playerData,
  );
  const gameContainerRef = React.useRef<HTMLDivElement | null>(null);
  const { startPhaserGame } = useWithPhaserGame(gameContainerRef);
  const { loadAvatarsFromDesc, saveAvatar } = useWithPlayer();
  const navigate = useNavigate();
  const [sceneCreated, setSceneCreated] = React.useState<boolean>(false);
  const [selectedAvatar, setSelectedAvatar] = React.useState<Avatars>();
  const [description, setDescription] = React.useState<string>("");
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  function onAvatarSelected(avatar: Avatars) {
    EventSystem.emit("addSystemMessage", {
      message: "Is this what you would like your avatar to be?",
    });
    EventSystem.emit("addChatMessage", {
      message: "Type 'yes' to accept, anything else to reject.",
    });
    setSelectedAvatar(avatar);
  }

  React.useEffect(() => {
    if (loginStatus.status !== 2) {
      return;
    }
    startPhaserGame(AvatarCreator, "AvatarCreator");
    EventSystem.on("sceneCreated", () => setSceneCreated(true));
    EventSystem.on("avatarSelected", onAvatarSelected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginStatus.status]);

  /**
   * Let's hard-code everything for now since player creation
   * goes before and is separate from the games themselves
   */

  React.useEffect(() => {
    if (!player) return;
    if (sceneCreated) {
      EventSystem.emit("addSystemMessage", {
        message: `Welcome to Math Meridio!`,
      });
      EventSystem.emit("addSystemMessage", {
        message: `It's nice to meet you, ${player.name}`,
      });
      EventSystem.emit("addSystemMessage", {
        message: "What would you like your avatar to look like?",
      });
      EventSystem.emit("addChatMessage", {
        message: "Use the chat box or mic button to respond:",
      });
    }
  }, [player, sceneCreated]);

  React.useEffect(() => {
    if (!isSaving) return;
    if (saveStatus.status === 2) {
      console.log("navigating to home");
      navigate("/classes");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSaving(false);
    } else if (saveStatus.status === 3) {
      setIsSaving(false);
      EventSystem.emit("addSystemMessage", {
        message: `Failed to save avatar. Would you like to try again? 'yes'/'no'`,
      });
    }
  }, [saveStatus, isSaving, navigate]);

  async function onUserMessage(msg: string): Promise<void> {
    EventSystem.emit("addChatMessage", msg);
    if (!selectedAvatar) {
      setDescription(msg);
      EventSystem.emit("loadingAvatars", true);
      EventSystem.emit("addSystemMessage", {
        message: "Fetching your avatar results...",
      });
      const response = await loadAvatarsFromDesc(msg);
      EventSystem.emit("loadingAvatars", false);
      EventSystem.emit("addSystemMessage", {
        message: response.message,
      });
      EventSystem.emit("showAvatars", response.avatars);
    } else if (selectedAvatar && !isSaving) {
      if (msg.toLowerCase().replace(" ", "") === "yes") {
        EventSystem.emit("addSystemMessage", {
          message: "Saving your avatar...",
        });
        saveAvatar(description, selectedAvatar.avatar);
        setIsSaving(true);
      } else {
        EventSystem.emit("addSystemMessage", {
          message: "What would you like your avatar to look like?",
        });
        EventSystem.emit("showAvatars", []);
        setSelectedAvatar(undefined);
      }
    }
  }

  /** end hard-coding */

  if (loginStatus.status === 0 || loginStatus.status === 1) {
    return (
      <div>
        <CircularProgress />
      </div>
    );
  }
  return (
    <>
      <div
        id="game-container"
        ref={gameContainerRef}
        style={{
          height: window.innerHeight - 150,
          width: window.innerWidth,
        }}
      />
      <ChatForm sendMessage={onUserMessage} isMyTurn={true} />
    </>
  );
}

const Page = withAuthorizationOnly(AvatarPage);
export default Page;
