import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  Article as ArticleIcon,
  Schedule as ScheduleIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
} from '@mui/icons-material';
import { AlertConfig, AlertType, AlertCondition, Alert as AlertInterface, ManualPosition } from '../../types';
import { usePositionAlerts } from '../../hooks/usePositionAlerts';

interface PositionAlertsManagerProps {
  open: boolean;
  position: ManualPosition;
  onClose: () => void;
}

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
      id={`alert-tabpanel-${index}`}
      aria-labelledby={`alert-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PositionAlertsManager: React.FC<PositionAlertsManagerProps> = ({
  open,
  position,
  onClose,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const {
    alerts,
    notifications,
    loading,
    error,
    manageAlert,
    dismissAlert,
    dismissNotification,
    clearAllNotifications,
  } = usePositionAlerts();

  // Form state for new alert
  const [newAlert, setNewAlert] = useState<Partial<AlertConfig>>({
    positionId: position.id || '',
    symbol: position.symbol,
    type: 'price',
    condition: 'above',
    value: 0,
    soundEnabled: true,
    emailEnabled: false,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateAlert = async () => {
    if (!newAlert.type || !newAlert.condition || !newAlert.value) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarOpen(true);
      return;
    }

    try {
      await manageAlert(newAlert as AlertConfig);
      setSnackbarMessage('Alert created successfully');
      setSnackbarOpen(true);
      
      // Reset form
      setNewAlert({
        positionId: position.id || '',
        symbol: position.symbol,
        type: 'price',
        condition: 'above',
        value: 0,
        soundEnabled: true,
        emailEnabled: false,
      });
    } catch (err) {
      setSnackbarMessage('Error creating alert');
      setSnackbarOpen(true);
    }
  };

  const handleQuickAlert = async (type: 'stop_loss' | 'take_profit', price: number) => {
    const alertConfig: AlertConfig = {
      positionId: position.id || '',
      symbol: position.symbol,
      type: 'price',
      condition: type === 'stop_loss' ? 'below' : 'above',
      value: price,
      message: `${type === 'stop_loss' ? 'Stop Loss' : 'Take Profit'} alert for ${position.symbol}`,
      soundEnabled: true,
      emailEnabled: false,
    };

    try {
      await manageAlert(alertConfig);
      setSnackbarMessage(`${type === 'stop_loss' ? 'Stop Loss' : 'Take Profit'} alert created`);
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Error creating quick alert');
      setSnackbarOpen(true);
    }
  };

  const getAlertTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'price':
        return <TrendingUpIcon />;
      case 'percentage':
        return <TrendingDownIcon />;
      case 'technical':
        return <ShowChartIcon />;
      case 'news':
        return <ArticleIcon />;
      case 'earnings':
        return <ScheduleIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getAlertTypeColor = (type: AlertType) => {
    switch (type) {
      case 'price':
        return 'primary';
      case 'percentage':
        return 'warning';
      case 'technical':
        return 'info';
      case 'news':
        return 'success';
      case 'earnings':
        return 'error';
      default:
        return 'default';
    }
  };

  const positionAlerts = alerts.filter(alert => alert.config.symbol === position.symbol);
  const positionNotifications = notifications.filter(notif => notif.positionSymbol === position.symbol);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Alert Manager - {position.symbol}
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Create Alert" />
              <Tab label="Active Alerts" />
              <Tab label="Alert History" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Quick Alert Buttons */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Alerts
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<TrendingDownIcon />}
                      onClick={() => handleQuickAlert('stop_loss', position.entryPrice * 0.95)}
                    >
                      Stop Loss (-5%)
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<TrendingUpIcon />}
                      onClick={() => handleQuickAlert('take_profit', position.entryPrice * 1.15)}
                    >
                      Take Profit (+15%)
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Custom Alert Form */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Custom Alert
                  </Typography>
                  
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" gap={2}>
                      <FormControl fullWidth>
                        <InputLabel>Alert Type</InputLabel>
                        <Select
                          value={newAlert.type}
                          label="Alert Type"
                          onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as AlertType }))}
                        >
                          <MenuItem value="price">Price Alert</MenuItem>
                          <MenuItem value="percentage">Percentage Change</MenuItem>
                          <MenuItem value="technical">Technical Indicator</MenuItem>
                          <MenuItem value="news">News Sentiment</MenuItem>
                          <MenuItem value="earnings">Earnings</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel>Condition</InputLabel>
                        <Select
                          value={newAlert.condition}
                          label="Condition"
                          onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as AlertCondition }))}
                        >
                          <MenuItem value="above">Above</MenuItem>
                          <MenuItem value="below">Below</MenuItem>
                          <MenuItem value="equals">Equals</MenuItem>
                          <MenuItem value="crosses_above">Crosses Above</MenuItem>
                          <MenuItem value="crosses_below">Crosses Below</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <TextField
                      label="Alert Value"
                      type="number"
                      value={newAlert.value}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                      fullWidth
                    />

                    <TextField
                      label="Custom Message (Optional)"
                      value={newAlert.message || ''}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
                      fullWidth
                      multiline
                      rows={2}
                    />

                    <Box display="flex" gap={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={newAlert.soundEnabled}
                            onChange={(e) => setNewAlert(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                          />
                        }
                        label="Sound Notification"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={newAlert.emailEnabled}
                            onChange={(e) => setNewAlert(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                          />
                        }
                        label="Email Notification"
                      />
                    </Box>

                    <Button
                      variant="contained"
                      onClick={handleCreateAlert}
                      disabled={loading}
                      startIcon={<NotificationsIcon />}
                    >
                      Create Alert
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">
                Active Alerts ({positionAlerts.length})
              </Typography>
              
              {positionAlerts.length === 0 ? (
                <Typography color="text.secondary">
                  No active alerts for this position
                </Typography>
              ) : (
                <List>
                  {positionAlerts.map((alert) => (
                    <ListItem key={alert.id} divider>
                      <Box display="flex" alignItems="center" gap={2} flex={1}>
                        {getAlertTypeIcon(alert.config.type)}
                        <Box flex={1}>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip
                                  label={alert.config.type}
                                  color={getAlertTypeColor(alert.config.type)}
                                  size="small"
                                />
                                <Typography variant="body1">
                                  {alert.config.condition} {alert.config.value}
                                </Typography>
                              </Box>
                            }
                            secondary={alert.config.message || 'No message'}
                          />
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          {alert.config.soundEnabled ? <VolumeUpIcon color="action" /> : <VolumeOffIcon color="action" />}
                        </Box>
                      </Box>
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => dismissAlert(alert.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Recent Notifications ({positionNotifications.length})
                </Typography>
                {positionNotifications.length > 0 && (
                  <Button onClick={clearAllNotifications} size="small">
                    Clear All
                  </Button>
                )}
              </Box>

              {positionNotifications.length === 0 ? (
                <Typography color="text.secondary">
                  No recent notifications for this position
                </Typography>
              ) : (
                <List>
                  {positionNotifications.map((notification) => (
                    <ListItem key={notification.id} divider>
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          <Box>
                            <Typography variant="body2">{notification.message}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(notification.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => dismissNotification(notification.id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
};

export default PositionAlertsManager;