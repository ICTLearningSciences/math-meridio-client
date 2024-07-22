/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { Delete } from '@mui/icons-material';
import { IconButton, Button } from '@mui/material';
import {
  InputField,
  SelectInputField,
  CheckBoxInput,
} from '../../shared/input-components';
import { JsonResponseData, JsonResponseDataType } from '../../types';
import {
  ColumnCenterDiv,
  ColumnDiv,
  RowDiv,
} from '../../../../styled-components';

export function JsonResponseDataUpdater(props: {
  jsonResponseData: JsonResponseData[];
  addNewJsonResponseData: (parentJsonResponseDataIds: string[]) => void;
  editDataField: (
    clientId: string,
    field: string,
    value: string | boolean,
    parentJsonResponseDataIds: string[]
  ) => void;
  deleteJsonResponseData: (
    clientId: string,
    parentJsonResponseDataIds: string[]
  ) => void;
  parentJsonResponseDataIds: string[];
}): JSX.Element {
  const {
    jsonResponseData,
    editDataField,
    deleteJsonResponseData,
    parentJsonResponseDataIds,
    addNewJsonResponseData,
  } = props;
  const availableTypes =
    parentJsonResponseDataIds.length !== 2
      ? [...Object.values(JsonResponseDataType)]
      : [JsonResponseDataType.STRING, JsonResponseDataType.ARRAY];

  return (
    <ColumnCenterDiv
      style={{
        border: '1px dotted grey',
        marginBottom: '10px',
        marginTop: '10px',
        marginLeft: `${parentJsonResponseDataIds.length * 60}px`,
      }}
    >
      {!parentJsonResponseDataIds.length && <h3>Json Response Data</h3>}
      {jsonResponseData?.map((jsonResponseData, index) => {
        return (
          <ColumnDiv
            key={index}
            style={{
              border: '1px solid black',
              position: 'relative',
              width: '95%',
            }}
          >
            <RowDiv
              style={{
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <RowDiv>
                <InputField
                  label="Variable Name"
                  value={jsonResponseData.name}
                  onChange={(e) => {
                    editDataField(
                      jsonResponseData.clientId,
                      'name',
                      e,
                      parentJsonResponseDataIds
                    );
                  }}
                />
                <SelectInputField
                  label="Type"
                  value={jsonResponseData.type}
                  options={availableTypes}
                  onChange={(e) => {
                    editDataField(
                      jsonResponseData.clientId,
                      'type',
                      e,
                      parentJsonResponseDataIds
                    );
                  }}
                />
                <CheckBoxInput
                  label="Is Required"
                  value={jsonResponseData.isRequired}
                  onChange={(e) => {
                    editDataField(
                      jsonResponseData.clientId,
                      'isRequired',
                      e,
                      parentJsonResponseDataIds
                    );
                  }}
                />
              </RowDiv>

              <IconButton
                onClick={() => {
                  deleteJsonResponseData(
                    jsonResponseData.clientId,
                    parentJsonResponseDataIds
                  );
                }}
              >
                <Delete />
              </IconButton>
            </RowDiv>
            <InputField
              label="Additional Info"
              maxRows={4}
              value={jsonResponseData.additionalInfo || ''}
              onChange={(e) => {
                editDataField(
                  jsonResponseData.clientId,
                  'additionalInfo',
                  e,
                  parentJsonResponseDataIds
                );
              }}
            />
            {jsonResponseData.type === JsonResponseDataType.OBJECT && (
              <JsonResponseDataUpdater
                jsonResponseData={jsonResponseData.subData || []}
                editDataField={editDataField}
                deleteJsonResponseData={deleteJsonResponseData}
                parentJsonResponseDataIds={[
                  ...parentJsonResponseDataIds,
                  jsonResponseData.clientId,
                ]}
                addNewJsonResponseData={addNewJsonResponseData}
              />
            )}
          </ColumnDiv>
        );
      })}
      <Button
        onClick={() => {
          addNewJsonResponseData(parentJsonResponseDataIds);
        }}
      >
        + Add Data Field
      </Button>
    </ColumnCenterDiv>
  );
}
