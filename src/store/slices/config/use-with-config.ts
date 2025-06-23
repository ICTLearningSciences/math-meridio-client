/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchAbeConfig } from '.';
import { TargetAiModelServiceType } from '../../../types';

export function useWithConfig() {
  const dispatch = useAppDispatch();
  const abeConfig = useAppSelector((state) => state.config.abeConfig);
  const abeConfigLoadStatus = useAppSelector(
    (state) => state.config.abeConfigLoadStatus
  );

  function loadAbeConfig() {
    dispatch(fetchAbeConfig());
  }

  function firstAvailableAzureServiceModel(): TargetAiModelServiceType {
    const azureModels = abeConfig.aiServiceModelConfigs.find(
      (config) => config.serviceName === 'AZURE_OPEN_AI'
    );
    if (!azureModels) {
      throw new Error('No Azure service found');
    }
    if (azureModels.modelList.length === 0) {
      throw new Error('No Azure service models found');
    }
    return {
      serviceName: 'AZURE_OPEN_AI',
      model: azureModels.modelList[0].name,
    };
  }

  return {
    abeConfig,
    abeConfigLoadStatus,
    loadAbeConfig,
    firstAvailableAzureServiceModel,
  };
}
