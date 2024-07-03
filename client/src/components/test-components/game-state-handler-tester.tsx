/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import { Button } from "@mui/material";
import { GameObjects } from "../../classes/game-state/types";
import { GameStateHandler } from "../../classes/game-state/game-state-handler";

const startingObjects: GameObjects[] = [
  {
    clientId: "1",
    name: "Object 1",
  },
  {
    clientId: "2",
    name: "Object 2",
  },
  {
    clientId: "3",
    name: "Object 3",
  },
  {
    clientId: "4",
    name: "Object 4",
  },
  {
    clientId: "5",
    name: "Object 5",
  },
];

/**
 * NOTE: This component is used to locally test the GameStateHandler class, and nothing more.
 */
export function GameStateHandlerTester() {
  const [gameStateHandler] = useState(new GameStateHandler(startingObjects));
  const [_, setForceUpdate] = useState(0);
  const [inProgress, setInProgress] = useState(false);
  const forceUpdate = () => setForceUpdate((prev) => prev + 1);

  return (
    <div>
      <h1>GameStateHandlerTester</h1>
      <div>
        {gameStateHandler.objects.map((obj) => (
          <div key={obj.clientId}>
            <p>{obj.name}</p>
            <p>{obj.clientId}</p>
          </div>
        ))}
      </div>
      <Button
        disabled={inProgress}
        onClick={async () => {
          setInProgress(true);
          await gameStateHandler.testAiRemoveItems();
          forceUpdate();
          setInProgress(false);
        }}
      >
        Test AI Remove Items
      </Button>
    </div>
  );
}
