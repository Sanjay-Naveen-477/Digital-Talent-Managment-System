import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import './Settings.css';

const API_URL = 'http://localhost:5000';

const TABS = [
  { id: 'profile', icon: '👤', label: 'Profile Settings' },
  { id: 'security', icon: '🔐', label: 'Security Settings' },
  { id: 'notifications', icon: '🔔', label: 'Notification Settings' },


];

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: 'User',
    bio: '',
    picture: ''
  });
  const [uploadError, setUploadError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securityError, setSecurityError] = useState('');
  const [securityMessage, setSecurityMessage] = useState('');

  const [notificationSettings, setNotificationSettings] = useState({
    taskAssignment: true,
    deadlineReminders: true,
    inAppNotifications: true
  });
  const [notificationError, setNotificationError] = useState('');
  const [deadlineCheckTimer, setDeadlineCheckTimer] = useState(null);
  const [deadlineCheckInterval, setDeadlineCheckInterval] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || '';
    const role = localStorage.getItem('userRole') || 'User';
    if (!email) {
      setProfile((prev) => ({ ...prev, role }));
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/profile`, { params: { email } });
        if (response.data.status === 'success') {
          const { name, email: serverEmail, role: serverRole, bio, picture } = response.data.user;
          setProfile({
            name: name || '',
            email: serverEmail || email,
            role: serverRole || role,
            bio: bio || '',
            picture: picture || localStorage.getItem('userProfilePicture') || ''
          });
        } else {
          setProfile((prev) => ({ ...prev, email, role }));
        }
      } catch (err) {
        setProfile((prev) => ({ ...prev, email, role }));
      }
    };

    loadProfile();

    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setNotificationSettings(JSON.parse(savedSettings));
      } catch (e) {
        setNotificationSettings({ taskAssignment: true, deadlineReminders: true, inAppNotifications: true });
      }
    }

    const runAssignedNotifications = async () => {
      const saved = localStorage.getItem('notificationSettings');
      const userSettings = saved ? JSON.parse(saved) : notificationSettings;
      if (!userSettings.taskAssignment && !userSettings.inAppNotifications) return;
      const loggedUserName = localStorage.getItem('userName') || '';
      const res = await axios.get(`${API_URL}/tasks`);
      if (res.data.status === 'success') {
        const assignedToMe = res.data.tasks.filter((t) => (t.assignedTo || '').toLowerCase() === loggedUserName.toLowerCase() && t.status !== 'completed');
        const alreadyNotified = JSON.parse(localStorage.getItem('notifiedTaskIds') || '[]');

        assignedToMe.forEach((task) => {
          if (!alreadyNotified.includes(task.id)) {
            toast(`Task assigned: ${task.name} (deadline: ${task.deadline || 'TBD'})`, { icon: '🔔' });
            alreadyNotified.push(task.id);
          }
        });

        localStorage.setItem('notifiedTaskIds', JSON.stringify(alreadyNotified));
      }
    };

    runAssignedNotifications();

    const getNextMorning10 = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0, 0);
      if (now >= next) next.setDate(next.getDate() + 1);
      return next;
    };

    let timeoutId;
    let intervalId;

    const sendDeadlineReminder = async () => {
      const saved = localStorage.getItem('notificationSettings');
      const userSettings = saved ? JSON.parse(saved) : notificationSettings;
      if (!userSettings.deadlineReminders) return;
      const loggedUserName = localStorage.getItem('userName') || '';
      const resp = await axios.get(`${API_URL}/tasks`);
      if (resp.data.status === 'success') {
        const today = new Date().toISOString().slice(0, 10);
        resp.data.tasks.forEach((task) => {
          if ((task.assignedTo || '').toLowerCase() === loggedUserName.toLowerCase() && task.status !== 'completed') {
            const due = task.deadline || task.dueDate || '';
            if (due && due <= today) {
              toast(`Deadline reminder: ${task.name} is due on ${due}`, { icon: '⏰' });
            }
          }
        });
      }
    };

    const scheduleReminderCheck = () => {
      const next = getNextMorning10();
      const delay = next.getTime() - Date.now();
      timeoutId = setTimeout(async () => {
        await sendDeadlineReminder();
        intervalId = setInterval(sendDeadlineReminder, 24 * 60 * 60 * 1000);
        setDeadlineCheckInterval(intervalId);
      }, delay);
      setDeadlineCheckTimer(timeoutId);
    };

    scheduleReminderCheck();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleSaveNotificationSettings = () => {
    if (!notificationSettings.taskAssignment && !notificationSettings.deadlineReminders && !notificationSettings.inAppNotifications) {
      setNotificationError('Please choose at least one notification option.');
      return;
    }

    setNotificationError('');
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    toast.success('Notification settings saved successfully.');
  };

  const handleNotificationToggle = (field) => {
    setNotificationSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (field === 'email' || field === 'name') setUploadError('');
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only JPG, PNG, and GIF files are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Profile picture must be smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({ ...prev, picture: reader.result }));
      setUploadError('');
    };
    reader.readAsDataURL(file);
  };

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSaveProfile = async () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      setUploadError('Name and email are required.');
      return;
    }
    if (!validateEmail(profile.email.trim())) {
      setUploadError('Please enter a valid email address.');
      return;
    }

    try {
      const currentEmail = localStorage.getItem('userEmail') || profile.email;
      const response = await axios.put(`${API_URL}/profile`, {
        currentEmail,
        name: profile.name.trim(),
        email: profile.email.trim(),
        bio: profile.bio,
        picture: profile.picture
      });

      if (response.data.status === 'success') {
        localStorage.setItem('userName', profile.name.trim());
        localStorage.setItem('userEmail', profile.email.trim());
        localStorage.setItem('userProfilePicture', profile.picture || '');
        localStorage.setItem('userBio', profile.bio || '');
        window.dispatchEvent(new Event('profileUpdated'));
        setUploadError('');
        setSaveMessage('Profile saved successfully.');
        toast.success('Profile updated successfully');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setUploadError(response.data.message || 'Unable to save profile.');
      }
    } catch (err) {
      setUploadError('Failed to save profile to server.');
    }
  };

  const handleSecurityChange = (field, value) => {
    setSecurityForm((prev) => ({ ...prev, [field]: value }));
    setSecurityError('');
    setSecurityMessage('');
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = securityForm;

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setSecurityError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      setSecurityError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError('New password and confirm password must match.');
      return;
    }
    if (newPassword === currentPassword) {
      setSecurityError('New password must be different from current password.');
      return;
    }

    try {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        setSecurityError('Unable to identify the logged-in user.');
        return;
      }

      const response = await axios.put(`${API_URL}/change-password`, {
        email,
        currentPassword,
        newPassword
      });

      if (response.data.status === 'success') {
        setSecurityMessage('Password updated successfully.');
        setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSecurityError('');
      } else {
        setSecurityError(response.data.message || 'Unable to update password.');
      }
    } catch (err) {
      setSecurityError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userProfilePicture');
    localStorage.removeItem('userBio');
    localStorage.removeItem('authToken');

    // Show logout message
    toast.success('Logged out successfully');

    // Redirect to login page
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="settings-section">
            <h2>Profile Settings</h2>
            <p className="settings-subtitle">Manage your basic account details.</p>
            <div className="settings-form">
              <div className="form-group profile-upload">
                <div className="profile-placeholder">
                  {profile.picture ? (
                    <img src={profile.picture} alt="Profile" className="profile-preview" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div>
                  <label htmlFor="profileUpload" className="btn-secondary">Upload Picture</label>
                  <input
                    id="profileUpload"
                    type="file"
                    accept="image/*"
                    onChange={handlePictureChange}
                    style={{ display: 'none' }}
                  />
                  {uploadError && <p className="upload-error">{uploadError}</p>}
                </div>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={profile.role} disabled />
              </div>
              <div className="form-group">
                <label>Bio / Role</label>
                <textarea
                  placeholder="Tell us about yourself..."
                  value={profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                ></textarea>
              </div>
              <div className="form-actions">
                <button className="btn-primary" type="button" onClick={handleSaveProfile}>Save Changes</button>
                <button className="btn-logout" type="button" onClick={handleLogout}>Logout</button>
              </div>
              {saveMessage && <div className="success-message">{saveMessage}</div>}
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
                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={securityForm.currentPassword}
                  onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="New Password"
                  value={securityForm.newPassword}
                  onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={securityForm.confirmPassword}
                  onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                />
              </div>
              {securityError && <p className="error-message">{securityError}</p>}
              {securityMessage && <p className="success-message">{securityMessage}</p>}
              <button className="btn-secondary" type="button" onClick={handleChangePassword}>Update Password</button>
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

      case 'notifications':
        return (
          <div className="settings-section">
            <h2>Notification Settings</h2>
            <p className="settings-subtitle">Control how you are alerted.</p>
            <div className="settings-form">
              <div className="flex-between settings-card">
                <span>In-app notifications</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.inAppNotifications}
                    onChange={() => handleNotificationToggle('inAppNotifications')}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="flex-between settings-card">
                <span>Task assignment alerts</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.taskAssignment}
                    onChange={() => handleNotificationToggle('taskAssignment')}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="flex-between settings-card">
                <span>Deadline reminders</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.deadlineReminders}
                    onChange={() => handleNotificationToggle('deadlineReminders')}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="form-actions">
                <button className="btn-primary" type="button" onClick={handleSaveNotificationSettings}>Save Notification Settings</button>
              </div>
              {notificationError && <p className="error-message">{notificationError}</p>}

            </div>
          </div>
        );





      default:
        return <div>Select a setting category</div>;
    }
  };

  return (
    <div className="settings-container dashboard-page">
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
