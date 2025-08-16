import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertConfig, Alert, AlertNotification } from '../types';
import { alertService, positionService } from '../services/api';

const ALERT_CHECK_INTERVAL = 30000; // 30 seconds
const LOCAL_STORAGE_KEY = 'position_alerts';
const NOTIFICATION_SOUND_URL = '/notification.mp3'; // Add sound file to public folder

interface UsePositionAlertsReturn {
  alerts: Alert[];
  notifications: AlertNotification[];
  loading: boolean;
  error: string | null;
  manageAlert: (config: AlertConfig) => Promise<void>;
  dismissAlert: (alertId: string) => void;
  dismissNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  checkAlerts: () => Promise<void>;
}

export const usePositionAlerts = (): UsePositionAlertsReturn => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.preload = 'auto';
    
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  // Load alerts from localStorage on mount
  useEffect(() => {
    loadAlertsFromStorage();
    // Temporarily disable alert polling to prevent 404 errors
    // startAlertPolling();
    
    return () => {
      stopAlertPolling();
    };
  }, []);

  const loadAlertsFromStorage = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setAlerts(data.alerts || []);
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error loading alerts from storage:', err);
    }
  };

  const saveAlertsToStorage = useCallback((alertsToSave: Alert[], notificationsToSave: AlertNotification[]) => {
    try {
      const data = {
        alerts: alertsToSave,
        notifications: notificationsToSave,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Error saving alerts to storage:', err);
    }
  }, []);

  const playNotificationSound = useCallback((soundEnabled: boolean = true) => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.warn('Could not play notification sound:', err);
      });
    }
  }, []);

  const createNotification = useCallback((alert: Alert): AlertNotification => {
    return {
      id: `notification_${Date.now()}_${Math.random()}`,
      title: `Alert: ${alert.config.symbol}`,
      message: alert.message,
      type: getNotificationType(alert.config.type),
      timestamp: new Date().toISOString(),
      positionSymbol: alert.config.symbol,
      dismissible: true,
    };
  }, []);

  const getNotificationType = (alertType: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (alertType) {
      case 'price':
      case 'percentage':
        return 'info';
      case 'technical':
        return 'warning';
      case 'news':
        return 'success';
      case 'earnings':
        return 'warning';
      default:
        return 'info';
    }
  };

  const manageAlert = useCallback(async (config: AlertConfig) => {
    try {
      setLoading(true);
      setError(null);

      let result: Alert;
      if (config.id) {
        // Update existing alert
        result = await alertService.updateAlert(config.id, config);
        setAlerts(prev => prev.map(alert => 
          alert.id === config.id ? result : alert
        ));
      } else {
        // Create new alert
        result = await alertService.createAlert(config);
        setAlerts(prev => [...prev, result]);
      }

      // Save to localStorage
      const updatedAlerts = config.id 
        ? alerts.map(alert => alert.id === config.id ? result : alert)
        : [...alerts, result];
      
      saveAlertsToStorage(updatedAlerts, notifications);

    } catch (err: any) {
      setError(err.message || 'Error managing alert');
      console.error('Error managing alert:', err);
    } finally {
      setLoading(false);
    }
  }, [alerts, notifications, saveAlertsToStorage]);

  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      await alertService.dismissAlert(alertId);
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'dismissed', dismissedAt: new Date().toISOString() }
          : alert
      ));

      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'dismissed' as const, dismissedAt: new Date().toISOString() }
          : alert
      );
      
      saveAlertsToStorage(updatedAlerts, notifications);

    } catch (err: any) {
      setError(err.message || 'Error dismissing alert');
      console.error('Error dismissing alert:', err);
    }
  }, [alerts, notifications, saveAlertsToStorage]);

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notification => 
      notification.id !== notificationId
    ));

    const updatedNotifications = notifications.filter(notification => 
      notification.id !== notificationId
    );
    
    saveAlertsToStorage(alerts, updatedNotifications);
  }, [alerts, notifications, saveAlertsToStorage]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    saveAlertsToStorage(alerts, []);
  }, [alerts, saveAlertsToStorage]);

  const checkAlerts = useCallback(async () => {
    try {
      const triggeredAlerts = await alertService.checkAlerts();
      
      if (triggeredAlerts.length > 0) {
        // Update alerts status
        setAlerts(prev => prev.map(alert => {
          const triggered = triggeredAlerts.find(ta => ta.id === alert.id);
          return triggered ? triggered : alert;
        }));

        // Create notifications for newly triggered alerts
        const newNotifications: AlertNotification[] = [];
        
        triggeredAlerts.forEach(alert => {
          if (alert.status === 'triggered' && alert.triggeredAt) {
            const notification = createNotification(alert);
            newNotifications.push(notification);
            
            // Play sound if enabled
            playNotificationSound(alert.config.soundEnabled);
          }
        });

        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev].slice(0, 10)); // Keep only last 10
          
          const updatedNotifications = [...newNotifications, ...notifications].slice(0, 10);
          saveAlertsToStorage(alerts, updatedNotifications);
        }
      }

      // Clean up expired alerts
      const now = new Date();
      setAlerts(prev => prev.filter(alert => {
        if (alert.config.expiresAt) {
          return new Date(alert.config.expiresAt) > now;
        }
        return true;
      }));

    } catch (err: any) {
      console.error('Error checking alerts:', err);
      // Don't set error state for polling failures to avoid UI disruption
    }
  }, [alerts, notifications, createNotification, playNotificationSound, saveAlertsToStorage]);

  const startAlertPolling = useCallback(() => {
    // Initial check
    checkAlerts();
    
    // Set up interval
    intervalRef.current = setInterval(checkAlerts, ALERT_CHECK_INTERVAL);
  }, [checkAlerts]);

  const stopAlertPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    alerts: alerts.filter(alert => alert.status === 'active'),
    notifications,
    loading,
    error,
    manageAlert,
    dismissAlert,
    dismissNotification,
    clearAllNotifications,
    checkAlerts,
  };
};

export default usePositionAlerts;