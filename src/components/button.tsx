/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import {
  Button,
  ButtonBaseProps,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import * as motion from 'motion/react-client';
import { makeStyles } from 'tss-react/mui';

const buttonStyles = makeStyles()(() => ({
  button: {
    display: 'flex',
    textTransform: 'none',
    fontSize: 12,
    borderRadius: 32,
  },
  textButton: {
    fontSize: 12,
    color: 'purple',
    textDecoration: 'underline',
    textDecorationColor: 'purple',
    textTransform: 'none',
    minHeight: 0,
    minWidth: 0,
    padding: 0,
  },
}));

interface MyButtonProps extends ButtonBaseProps {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (e: any) => void;
  icon?: JSX.Element;
  endIcon?: JSX.Element;
  disabled?: boolean;
  loading?: boolean;
  color?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';
  tooltip?: string;
  style?: React.CSSProperties;
}

export function ContainedButton(props: MyButtonProps): JSX.Element {
  const { classes } = buttonStyles();
  return (
    <motion.div whileHover={{ scale: 1.05, filter: 'brightness(0.8)' }}>
      <Button
        size="medium"
        variant="contained"
        disableElevation
        className={classes.button}
        disabled={props.disabled || props.loading}
        onClick={props.onClick}
        color={props.color}
        style={{ ...props.style }}
        startIcon={
          props.loading ? (
            <CircularProgress color="inherit" size={16} />
          ) : (
            props.icon
          )
        }
        endIcon={!props.loading && props.endIcon}
      >
        {props.children}
      </Button>
    </motion.div>
  );
}

export function OutlinedButton(props: MyButtonProps): JSX.Element {
  const { classes } = buttonStyles();
  return (
    <motion.div whileHover={{ scale: 1.05, filter: 'brightness(0.8)' }}>
      <Button
        size="medium"
        variant="outlined"
        className={classes.button}
        startIcon={
          props.loading ? (
            <CircularProgress color="inherit" size={16} />
          ) : (
            props.icon
          )
        }
        endIcon={props.loading ? undefined : props.endIcon}
        disabled={props.disabled || props.loading}
        onClick={props.onClick}
        style={{
          color: props.color,
          borderColor: props.color,
          ...props.style,
        }}
      >
        {props.children}
      </Button>
    </motion.div>
  );
}

export function TextButton(props: MyButtonProps): JSX.Element {
  const { classes } = buttonStyles();
  return (
    <Button
      size="medium"
      variant="text"
      endIcon={props.icon}
      className={classes.textButton}
      disabled={props.disabled}
      onClick={props.onClick}
      style={{
        color: props.color || 'purple',
        textDecorationColor: props.color || 'purple',
        ...props.style,
      }}
    >
      {props.children}
    </Button>
  );
}

export function DropdownButton(props: {
  label: string;
  value: string | undefined;
  items: string[];
  children?: React.ReactNode;
  onSelect: (v: string) => void;
  renderItem?: (v: string) => JSX.Element | string;
}): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleItemClick = (v: string) => {
    props.onSelect(v);
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        style={{ color: 'black', fontSize: 18, fontWeight: 'bold' }}
        endIcon={<ArrowDropDown />}
        onClick={handleButtonClick}
      >
        {props.label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          style: { width: '100%' },
        }}
      >
        {props.items.map((item) => {
          return (
            <MenuItem
              key={item}
              selected={props.value === item}
              onClick={() => handleItemClick(item)}
            >
              {props.renderItem ? props.renderItem(item) : item}
            </MenuItem>
          );
        })}
        {props.children}
      </Menu>
    </div>
  );
}
