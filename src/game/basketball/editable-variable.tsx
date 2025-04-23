/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useCallback } from 'react';
import { Card, TextField, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import {
  GameStateData,
  INSIDE_SHOT_PERCENT,
  MID_SHOT_PERCENT,
  OUTSIDE_SHOT_PERCENT,
} from './solution';
import { useDebouncedCallback } from '../../hooks/use-debounced-callback';
import { didGameStateDataChange } from '../../helpers';
export const EditableVariable = React.memo(
  function EditableVariable(props: {
    dataKey: string;
    title: string;
    updatePlayerStateData: (value: number) => void;
    myPlayerStateData: GameStateData;
  }): JSX.Element {
    const { updatePlayerStateData, myPlayerStateData, dataKey, title } = props;
    const data = myPlayerStateData[dataKey];
    const otherKeys = [
      INSIDE_SHOT_PERCENT,
      MID_SHOT_PERCENT,
      OUTSIDE_SHOT_PERCENT,
    ].filter((key) => key !== dataKey);
    const otherKeysTotal = otherKeys.reduce(
      (acc, key) => acc + (myPlayerStateData[key] || 0),
      0
    );
    const [value, setValue] = React.useState(data || 0);
    const { classes } = useStyles();

    const debouncedUpdate = useDebouncedCallback(
      useCallback(
        (newValue: number, otherKeysTotal: number) => {
          const data = { ...myPlayerStateData };
          let newVal = newValue;
          data[dataKey] = newValue;
          if (otherKeysTotal + newValue > 100) {
            newVal = 100 - otherKeysTotal;
          }
          setValue(newVal);
          updatePlayerStateData(newVal);
        },
        [updatePlayerStateData, myPlayerStateData, dataKey]
      ),
      300
    );

    useEffect(() => {
      setValue(data);
    }, [data]);

    return (
      <Card
        className={classes.box}
        style={{
          backgroundColor: '#fff8db',
          borderColor: 'red',
          display: value !== undefined ? '' : 'none',
        }}
      >
        <Typography className={classes.text} style={{ color: '#c96049' }}>
          {title}
        </Typography>
        <TextField
          value={value || 0}
          variant="standard"
          type="number"
          sx={{
            input: {
              color: '#c96049',
              fontSize: 40,
              fontFamily: 'SigmarOne',
              textAlign: 'center',
              margin: 0,
              padding: 0,
            },
            '& .MuiInput-underline:before': { borderBottomColor: '#c96049' },
            '& .MuiInput-underline:after': { borderBottomColor: '#c96049' },
          }}
          InputProps={{ inputProps: { min: 0, max: 100 } }}
          onChange={(e) => {
            const newValue = parseInt(e.target.value);
            setValue(newValue);
            debouncedUpdate(newValue, otherKeysTotal);
          }}
        />
      </Card>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.dataKey === nextProps.dataKey &&
      prevProps.title === nextProps.title &&
      !didGameStateDataChange(
        prevProps.myPlayerStateData,
        nextProps.myPlayerStateData
      )
    );
  }
);

const useStyles = makeStyles()(() => ({
  box: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 10,
    height: 'auto',
    width: 'auto',
    minWidth: 100,
    border: '1px solid lightgrey',
    boxShadow: '-5px 5px 10px 0px rgba(0,0,0,0.75)',
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'center',
  },
}));
