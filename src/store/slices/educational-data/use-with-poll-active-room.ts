/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useRef } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { UseWithEducationalData } from './use-with-educational-data';

export function useWithPollActiveRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const educationalDataContext = useOutletContext<UseWithEducationalData>();
  const { pingGameRoomProcess, fetchRoom } = educationalDataContext;

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
