import React, { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import './NotificationCenter.css';

export default function NotificationCenter() {
  const {
    notifications,
    showNotificationCenter,
    setShowNotificationCenter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading
  } = useContext(NotificationContext);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-GB');
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleClose = () => {
    setShowNotificationCenter(false);
  };

  if (!showNotificationCenter) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="notification-backdrop" onClick={handleClose}></div>
      
      {/* Notification Center Modal */}
      <div className="notification-center">
        {/* Header */}
        <div className="notification-header">
          <div className="notification-title">
            <h3>Notifications</h3>
            {unreadNotifications.length > 0 && (
              <span className="notification-unread-badge">
                {unreadNotifications.length}
              </span>
            )}
          </div>
          <button className="close-btn" onClick={handleClose}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mark All As Read Button */}
        {unreadNotifications.length > 0 && (
          <button className="mark-all-read-btn" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}

        {/* Notifications List */}
        <div className="notification-list">
          {isLoading ? (
            <div className="notification-loading">
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-item-content">
                  <div className="notification-item-header">
                    <h4>{notification.taskName}</h4>
                    {!notification.isRead && <span className="unread-indicator"></span>}
                  </div>
                  <p className="notification-item-description">
                    {notification.taskDescription || 'A new task has been assigned to you'}
                  </p>
                  <p className="notification-item-meta">
                    Assigned by: <strong>{notification.assignedBy}</strong>
                    {notification.deadline && (
                      <span className="deadline-info">
                        • Deadline: {new Date(notification.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </p>
                  <p className="notification-item-time">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                <button
                  className="delete-notification-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  title="Delete notification"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
