/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  addOrUpdateDiscussionStage as _addOrUpdateDiscussionStage,
  fetchDiscussionStages as _fetchDiscussionStages,
  addNewLocalDiscussionStage as _addNewLocalDiscussionStage,
} from '.';
import {
  defaultDicussionStage,
  DiscussionStage,
} from '../../../components/discussion-stage-builder/types';

export function useWithStages() {
  const dispatch = useAppDispatch();
  const discussionStages = useAppSelector(
    (state) => state.stages.discussionStages
  );
  const loadStagesStatus = useAppSelector(
    (state) => state.stages.loadStagesStatus
  );

  async function addOrUpdateDiscussionStage(
    stage: DiscussionStage
  ): Promise<DiscussionStage> {
    const res = await dispatch(_addOrUpdateDiscussionStage(stage));
    return res.payload as DiscussionStage;
  }

  async function loadDiscussionStages(): Promise<DiscussionStage[]> {
    const res = await dispatch(_fetchDiscussionStages());
    return res.payload as DiscussionStage[];
  }

  function addNewLocalDiscussionStage(): DiscussionStage {
    const stage = defaultDicussionStage();
    dispatch(_addNewLocalDiscussionStage(stage));
    return stage;
  }

  return {
    addOrUpdateDiscussionStage,
    loadDiscussionStages,
    addNewLocalDiscussionStage,
    discussionStages,
    loadStagesStatus,
  };
}
