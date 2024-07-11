/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Input,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
} from "@mui/material";
import { useDebouncedCallback } from "../../../hooks/use-debounced-callback";

export function InputField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  width?: string;
  maxRows?: number;
}): JSX.Element {
  const [localValue, setLocalValue] = React.useState(props.value);
  const debounceOnChange = useDebouncedCallback((v: string) => {
    props.onChange(v);
  }, 500);

  useEffect(() => {
    debounceOnChange(localValue);
  }, [localValue]);

  return (
    <FormControl
      variant="standard"
      sx={{ m: 1, minWidth: 120, width: props.width || "80%" }}
    >
      <InputLabel>{props.label}</InputLabel>
      <Input
        value={localValue}
        multiline
        onFocus={props.onFocus}
        maxRows={props.maxRows ?? undefined}
        onChange={(e) => {
          setLocalValue(e.target.value);
        }}
      />
    </FormControl>
  );
}

export function CheckBoxInput(props: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}): JSX.Element {
  return (
    <FormControlLabel
      label={props.label}
      style={{
        margin: 0,
      }}
      control={
        <Checkbox
          checked={Boolean(props.value)}
          indeterminate={false}
          onChange={(e) => {
            props.onChange(e.target.checked);
          }}
        />
      }
    />
  );
}

export function SelectInputField(props: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}): JSX.Element {
  const { label, options, onChange, value } = props;
  return (
    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id={"select-field-label"}>{label}</InputLabel>
      <Select
        labelId="demo-simple-select-standard-label"
        id="demo-simple-select-standard"
        value={value}
        onChange={(e) => {
          onChange(e.target.value as string);
        }}
        label="Output Data Type"
      >
        {options.map((option, i) => (
          <MenuItem key={i} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
