import React, { createContext, useState, useCallback, useEffect } from 'react';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  const userEmail = localStorage.getItem('userEmail');
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!userEmail) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/notifications?email=${userEmail}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, API_URL]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/read`,
        { method: 'PUT' }
      );
      const data = await response.json();
      
      if (data.status === 'success') {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [API_URL]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!userEmail) return;
    
    try {
      const response = await fetch(
        `${API_URL}/notifications/batch/read?email=${userEmail}`,
        { method: 'PUT' }
      );
      const data = await response.json();
      
      if (data.status === 'success') {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [userEmail, API_URL]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await fetch(
        `${API_URL}/notifications/${notificationId}`,
        { method: 'DELETE' }
      );
      const data = await response.json();
      
      if (data.status === 'success') {
        setNotifications(prev => 
          prev.filter(n => n.id !== notificationId)
        );
        // Recalculate unread count
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        const newUnreadCount = updatedNotifications.filter(n => !n.isRead).length;
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [notifications, API_URL]);

  // Polling for new notifications
  useEffect(() => {
    if (!userEmail) return;

    // Initial fetch
    fetchNotifications();

    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [userEmail, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    showNotificationCenter,
    setShowNotificationCenter,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
