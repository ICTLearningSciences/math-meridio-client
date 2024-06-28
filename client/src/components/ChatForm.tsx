/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Send } from "@mui/icons-material";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { sendChatMessage } from "../store/slices/gameData";

export default function ChatForm(): JSX.Element {
  const dispatch = useAppDispatch();
  const { gameRoom } = useAppSelector((state) => state.gameData);
  const { userId, username } = useAppSelector((state) => state.userData);
  const [input, setInput] = React.useState<string>("");

  function sendMessage(): void {
    setInput("");
    dispatch(
      sendChatMessage({
        senderId: userId,
        senderName: username,
        message: input,
        gameRoom: gameRoom,
      })
    );
  }

  return (
    <FormControl sx={{ m: 1, width: "100%" }} variant="outlined">
      <InputLabel>Chat:</InputLabel>
      <OutlinedInput
        label="Chat:"
        type="text"
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              type="submit"
              color="primary"
              edge="end"
              onClick={sendMessage}
            >
              <Send />
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  );
}
