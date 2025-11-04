import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { PupupuV2View } from './PupupuV2View';
import PupupuV3View from '../PupupuV3/PupupuV3View';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pupupu-tabpanel-${index}`}
      aria-labelledby={`pupupu-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export const PupupuV2Dashboard: React.FC = () => {
  // Tab state
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Pupupu BTC Trading Strategies
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="pupupu btc strategy tabs">
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <span>📊 5-min Strategy</span>
              </Box>
            }
            id="pupupu-tab-0"
            aria-controls="pupupu-tabpanel-0"
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <span>⚡ 1-min Scalping</span>
              </Box>
            }
            id="pupupu-tab-1"
            aria-controls="pupupu-tabpanel-1"
          />
        </Tabs>
      </Box>

      {/* Tab Panel 0: BTC 5-min Strategy */}
      <TabPanel value={currentTab} index={0}>
        <PupupuV2View />
      </TabPanel>

      {/* Tab Panel 1: BTC 1-min Scalping with ML */}
      <TabPanel value={currentTab} index={1}>
        <PupupuV3View />
      </TabPanel>
    </Box>
  );
};
