import React, { useState } from 'react';
import './Settings.css';

const TABS = [
  { id: 'profile', icon: '👤', label: 'Profile Settings' },
  { id: 'security', icon: '🔐', label: 'Security Settings' },
  { id: 'roles', icon: '🎭', label: 'Role & Permissions' },
  { id: 'notifications', icon: '🔔', label: 'Notification Settings' },
  { id: 'tasks', icon: '📊', label: 'Task Preferences' },
  { id: 'privacy', icon: '🗂️', label: 'Data & Privacy' },
  { id: 'admin', icon: '🏢', label: 'Admin Settings' },

];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="settings-section">
            <h2>Profile Settings</h2>
            <p className="settings-subtitle">Manage your basic account details.</p>
            <div className="settings-form">
              <div className="form-group profile-upload">
                <div className="profile-placeholder">👤</div>
                <button className="btn-secondary">Upload Picture</button>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label>Bio / Role</label>
                <textarea placeholder="Tell us about yourself..."></textarea>
              </div>
              <div className="form-actions">
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="settings-section">
            <h2>Security Settings</h2>
            <p className="settings-subtitle">Keep your account secure.</p>
            <div className="settings-card">
              <h3>Change Password</h3>
              <div className="form-group">
                <input type="password" placeholder="Current Password" />
              </div>
              <div className="form-group">
                <input type="password" placeholder="New Password" />
              </div>
              <button className="btn-secondary">Update Password</button>
            </div>
            <div className="settings-card">
              <div className="flex-between">
                <div>
                  <h3>Two-Factor Authentication (2FA)</h3>
                  <p>Add an extra layer of security to your account.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <div className="settings-card">
              <h3>Active Sessions</h3>
              <p>Logged in on Chrome, Windows (Current)</p>
              <button className="btn-danger mt-3">Logout from all devices</button>
            </div>
            <div className="settings-card">
              <h3>Account Activity Log</h3>
              <ul className="activity-list">
                <li>Logged in from Windows • 2 hours ago</li>
                <li>Changed password • 1 week ago</li>
              </ul>
            </div>
          </div>
        );
      case 'roles':
        return (
          <div className="settings-section">
            <h2>Role & Permissions</h2>
            <p className="settings-subtitle">Manage system access levels.</p>
            <div className="settings-card highlight-card">
              <h3>Current Role: <span className="badge">Admin</span></h3>
              <p>You have full access to system configurations.</p>
            </div>
            <div className="settings-card">
              <h3>Assign Roles (Admin Only)</h3>
              <div className="form-group flex-row">
                <input type="email" placeholder="User email" style={{ flex: 1 }} />
                <select>
                  <option>User</option>
                  <option>Manager</option>
                  <option>Admin</option>
                </select>
                <button className="btn-primary">Assign</button>
              </div>
            </div>
            <div className="settings-card">
              <h3>Manage Permissions</h3>
              <div className="permissions-list">
                <label className="checkbox-label"><input type="checkbox" defaultChecked /> Can create tasks</label>
                <label className="checkbox-label"><input type="checkbox" defaultChecked /> Can delete users</label>
                <label className="checkbox-label"><input type="checkbox" /> Can view all reports</label>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="settings-section">
            <h2>Notification Settings</h2>
            <p className="settings-subtitle">Control how you are alerted.</p>
            <div className="settings-form">
              {[
                "Email notifications",
                "Task assignment alerts",
                "Deadline reminders",
                "Completion updates"
              ].map(notif => (
                <div className="flex-between settings-card" key={notif}>
                  <span>{notif}</span>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="settings-section">
            <h2>Task Preferences</h2>
            <div className="settings-card">
              <h3>Default Task Status</h3>
              <select className="full-width-select">
                <option>To Do</option>
                <option>In Progress</option>
                <option>Under Review</option>
              </select>
            </div>
            <div className="settings-card">
              <h3>Task Sorting</h3>
              <select className="full-width-select">
                <option>Deadline (Closest first)</option>
                <option>Priority (High first)</option>
                <option>Date Created (Newest first)</option>
              </select>
            </div>
            <div className="settings-card flex-between">
              <span>Show Completed Tasks</span>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="settings-section">
            <h2>Data & Privacy</h2>
            <div className="settings-card">
              <h3>Download User Data</h3>
              <p>Export all your tasks, activity and profile data.</p>
              <button className="btn-secondary mt-2">Request Data Export</button>
            </div>
            <div className="settings-card">
              <h3>Privacy Settings</h3>
              <label className="checkbox-label"><input type="checkbox" defaultChecked /> Make profile visible to teammates</label>
            </div>
            <div className="settings-card danger-zone">
              <h3>Delete Account</h3>
              <p>Once you delete your account, there is no going back. Please be certain.</p>
              <button className="btn-danger mt-2">Delete Account</button>
            </div>
          </div>
        );
      case 'admin':
        return (
          <div className="settings-section">
            <h2>Admin Settings</h2>
            <div className="settings-card">
              <h3>Manage Users</h3>
              <button className="btn-primary mt-2">Open User Directory</button>
            </div>
            <div className="settings-card">
              <h3>System Configurations</h3>
              <p>Maintenance mode, global announcements.</p>
              <button className="btn-secondary mt-2">Configure System</button>
            </div>
            <div className="settings-card">
              <h3>Task Categories</h3>
              <div className="tags-container mt-2">
                <span className="tag">Development</span>
                <span className="tag">Marketing</span>
                <span className="tag">Design</span>
                <button className="tag add-tag">+ Add</button>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a setting category</div>;
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences.</p>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="settings-content">
          <div className="settings-content-inner">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
