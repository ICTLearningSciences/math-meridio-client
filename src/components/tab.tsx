/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from 'react';
import { AnimatePresence } from 'motion/react';
import * as motion from 'motion/react-client';
import { ContainedButton, OutlinedButton } from './button';

export interface Tab {
  name: string;
  element: React.ReactNode;
}

export function TabButton(props: {
  value: number;
  index: number;
  children: React.ReactNode;
  onClick: (idx: number) => void;
}): JSX.Element {
  const { value, index } = props;
  if (value === index) {
    return (
      <OutlinedButton
        style={{ color: 'black', borderColor: 'black' }}
        onClick={() => props.onClick(index)}
      >
        {props.children}
      </OutlinedButton>
    );
  }
  return (
    <ContainedButton
      style={{
        backgroundColor: 'rgb(231, 231, 231)',
        color: 'black',
      }}
      onClick={() => props.onClick(index)}
    >
      {props.children}
    </ContainedButton>
  );
}

export function TabItem(props: {
  value: number;
  index: number;
  children: React.ReactNode;
}): JSX.Element {
  const { value, index } = props;
  return (
    <div hidden={value !== index}>{value === index && props.children}</div>
  );
}

export function Tabs(props: { tabs: Tab[] }): JSX.Element {
  const { tabs } = props;
  const [selectedTab, setSelectedTab] = React.useState<number>(0);
  const tab = tabs[selectedTab];

  if (tabs.length === 0) return <div />;
  return (
    <div>
      <div className="row spacing">
        {tabs.map((t, i) => (
          <TabButton
            key={i}
            value={selectedTab}
            index={i}
            onClick={setSelectedTab}
          >
            {t.name}
          </TabButton>
        ))}
      </div>
      <div></div>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab ? tab.name : 'empty'}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab.element}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
