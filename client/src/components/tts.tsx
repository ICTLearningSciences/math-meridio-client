import React from "react";
import { useTts, TTSHookProps } from "tts-react";
import EventSystem from "../game/event-system";
import { ChatMessage } from "../types";

interface SpeakProps extends TTSHookProps {
  message: ChatMessage | undefined;
}
export function TtsSpeak({ children, message }: SpeakProps): JSX.Element {
  // useTts relies on window which doesn't exist in gatsby dev
  // since we can't edit the library, check for window here and skip tts
  if (typeof window === "undefined") {
    return <div>{children}</div>;
  }

  const { ttsChildren, state } = useTts({
    children,
    markTextAsSpoken: true,
    markColor: "white",
    markBackgroundColor: "#70CEFF",
    autoPlay: true,
    onStart: () => {
      console.log("playing?")
    },
    onEnd: () => {
      EventSystem.emit("ttsFinished", message)
    },
  });

  return <div>{ttsChildren}</div>;
}
