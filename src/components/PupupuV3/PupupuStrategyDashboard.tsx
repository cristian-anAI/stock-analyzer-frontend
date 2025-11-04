import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import BoxStrategyView from '../BoxStrategy/BoxStrategyView';
import PupupuV3View from './PupupuV3View';

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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const PupupuStrategyDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" component="h1" mb={3}>
        📦 Pupupu Trading Strategies
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="pupupu strategy tabs">
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <span>📦 Box Strategy</span>
                <Typography variant="caption" color="text.secondary">
                  (5-min)
                </Typography>
              </Box>
            }
            id="pupupu-tab-0"
            aria-controls="pupupu-tabpanel-0"
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <span>⚡ PupupuV3 Scalping</span>
                <Typography variant="caption" color="text.secondary">
                  (1-min)
                </Typography>
              </Box>
            }
            id="pupupu-tab-1"
            aria-controls="pupupu-tabpanel-1"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <BoxStrategyView />
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <PupupuV3View />
      </TabPanel>
    </Box>
  );
};

export default PupupuStrategyDashboard;
