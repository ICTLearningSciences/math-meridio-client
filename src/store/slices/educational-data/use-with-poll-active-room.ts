import { useEffect, useRef } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { UseWithEducationalData } from "./use-with-educational-data";

export function useWithPollActiveRoom() {
    const { roomId } = useParams<{ roomId: string }>();
    const educationalDataContext = useOutletContext<UseWithEducationalData>()
    const {pingGameRoomProcess, fetchRoom} = educationalDataContext;

    // Store latest callback references
    const pingRef = useRef(pingGameRoomProcess);
    const fetchRef = useRef(fetchRoom);

    // Update refs when callbacks change
    useEffect(() => {
        pingRef.current = pingGameRoomProcess;
        fetchRef.current = fetchRoom;
    }, [pingGameRoomProcess, fetchRoom]);

    useEffect(() => {
        if (!roomId) {
            return;
        }

        // Start polling immediately
        pingRef.current(roomId);
        fetchRef.current(roomId);

        // Set up interval to poll every 2 seconds
        const intervalId = setInterval(() => {
            pingRef.current(roomId);
            fetchRef.current(roomId);
        }, 2000);

        // Cleanup: clear interval when roomId changes or component unmounts
        return () => {
            clearInterval(intervalId);
        };
    }, [roomId]); // Only depend on roomId
}