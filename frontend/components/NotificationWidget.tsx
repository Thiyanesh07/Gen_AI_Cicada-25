import React, { useState, useEffect } from 'react';
import { Notification, NotificationType, NotificationStats } from '../types';
import { getNotifications, markNotificationRead, deleteNotification, getNotificationStats } from '../services/apiService';

interface NotificationWidgetProps {
  refreshInterval?: number; // milliseconds
  maxDisplay?: number;
}

export const NotificationWidget: React.FC<NotificationWidgetProps> = ({
  refreshInterval = 300000, // 5 minutes default
  maxDisplay = 5,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  useEffect(() => {
    loadNotifications();
    loadStats();
    
    // Auto-refresh
    const interval = setInterval(() => {
      loadNotifications();
      loadStats();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [filter, refreshInterval]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications(filter === 'unread');
      setNotifications(data);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      // Set friendly error message for missing backend
      setError('Backend not connected. Start the backend server to see notifications.');
      setNotifications([]); // Clear notifications on error
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getNotificationStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load notification stats:', err);
      // Set default stats when backend is not available
      setStats({ total: 0, unread: 0, by_type: { info: 0, warning: 0, alert: 0 } });
    }
  };

  const handleMarkRead = async (notificationId: number, isRead: boolean) => {
    try {
      await markNotificationRead(notificationId, isRead);
      await loadNotifications();
      await loadStats();
    } catch (err: any) {
      console.error('Failed to mark notification:', err);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
      await loadNotifications();
      await loadStats();
    } catch (err: any) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.ALERT:
        return '#f44336'; // Red
      case NotificationType.WARNING:
        return '#ff9800'; // Orange
      case NotificationType.INFO:
      default:
        return '#2196F3'; // Blue
    }
  };

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.ALERT:
        return '🚨';
      case NotificationType.WARNING:
        return '⚠️';
      case NotificationType.INFO:
      default:
        return 'ℹ️';
    }
  };

  const getWeatherIcon = (condition?: string | null): string => {
    if (!condition) return '🌤️';
    const lower = condition.toLowerCase();
    if (lower.includes('rain')) return '🌧️';
    if (lower.includes('cloud')) return '☁️';
    if (lower.includes('clear')) return '☀️';
    if (lower.includes('storm')) return '⛈️';
    if (lower.includes('snow')) return '❄️';
    if (lower.includes('fog') || lower.includes('mist')) return '🌫️';
    return '🌤️';
  };

  const displayedNotifications = showAll 
    ? notifications 
    : notifications.slice(0, maxDisplay);

  return (
    <div className="notification-widget" style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '20px',
      maxWidth: '100%',
      width: '100%',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '10px',
      }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          🌦️ Weather Notifications
          {stats && stats.unread > 0 && (
            <span style={{
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}>
              {stats.unread}
            </span>
          )}
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
            style={{
              padding: '5px 10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '12px',
            }}
          >
            <option value="unread">Unread</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={loadNotifications}
            style={{
              padding: '5px 10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            🔄
          </button>
        </div>
      </div>

      {stats && (
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '15px',
          fontSize: '12px',
        }}>
          <div style={{ flex: 1, padding: '8px', backgroundColor: '#e3f2fd', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>{stats.by_type.info}</div>
            <div style={{ color: '#666' }}>Info</div>
          </div>
          <div style={{ flex: 1, padding: '8px', backgroundColor: '#fff3e0', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>{stats.by_type.warning}</div>
            <div style={{ color: '#666' }}>Warnings</div>
          </div>
          <div style={{ flex: 1, padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>{stats.by_type.alert}</div>
            <div style={{ color: '#666' }}>Alerts</div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
          Loading notifications...
        </div>
      ) : error ? (
        <div style={{
          padding: '10px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          fontSize: '14px',
        }}>
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '30px',
          color: '#888',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
          <div>No notifications to display</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            Add crops and generate weather updates!
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: '12px',
                  backgroundColor: notification.is_read ? '#f9f9f9' : '#fffde7',
                  border: `2px solid ${getNotificationColor(notification.notification_type)}`,
                  borderLeft: `6px solid ${getNotificationColor(notification.notification_type)}`,
                  borderRadius: '6px',
                  position: 'relative',
                  opacity: notification.is_read ? 0.7 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <span style={{ fontSize: '20px' }}>
                        {getNotificationIcon(notification.notification_type)}
                      </span>
                      <strong style={{ color: getNotificationColor(notification.notification_type) }}>
                        {notification.crop_name}
                      </strong>
                      {notification.weather_condition && (
                        <span style={{ fontSize: '16px' }}>
                          {getWeatherIcon(notification.weather_condition)}
                        </span>
                      )}
                    </div>
                    
                    <p style={{ 
                      margin: '8px 0', 
                      fontSize: '14px', 
                      lineHeight: '1.4',
                      color: '#333',
                    }}>
                      {notification.message}
                    </p>
                    
                    <div style={{ 
                      display: 'flex', 
                      gap: '15px', 
                      fontSize: '12px', 
                      color: '#666',
                      marginTop: '8px',
                    }}>
                      {notification.temperature && (
                        <span>🌡️ {notification.temperature}°C</span>
                      )}
                      {notification.humidity && (
                        <span>💧 {notification.humidity}%</span>
                      )}
                      {notification.weather_condition && (
                        <span>{notification.weather_condition}</span>
                      )}
                    </div>
                    
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
                      {new Date(notification.created_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '10px' }}>
                    <button
                      onClick={() => handleMarkRead(notification.id, !notification.is_read)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        backgroundColor: notification.is_read ? '#2196F3' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                      title={notification.is_read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {notification.is_read ? '📭' : '✓'}
                    </button>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                      title="Delete notification"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {notifications.length > maxDisplay && (
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '10px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#2196F3',
              }}
            >
              {showAll ? 'Show Less ▲' : `Show All (${notifications.length}) ▼`}
            </button>
          )}
        </>
      )}
    </div>
  );
};
