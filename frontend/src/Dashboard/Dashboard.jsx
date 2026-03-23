import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Chart from 'chart.js/auto';
import axios from 'axios';
import './Dashboard.css';

export default function Dashboard() {
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');
    const location = useLocation();

    const taskDistRef = useRef(null);
    const completionStatsRef = useRef(null);

    const [tasks, setTasks] = useState([]);
    const [metrics, setMetrics] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        rate: 0
    });

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/tasks');
                if (response.data.status === 'success') {
                    const fetchedTasks = response.data.tasks;
                    setTasks(fetchedTasks);
                    
                    const total = fetchedTasks.length;
                    const completed = fetchedTasks.filter(t => t.status === 'completed').length;
                    const pending = fetchedTasks.filter(t => t.status === 'pending').length;
                    const inProgress = fetchedTasks.filter(t => t.status === 'progress').length;
                    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                    
                    setMetrics({ total, completed, pending: pending + inProgress, rate });
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchTasks();
    }, []);

    useEffect(() => {
        let taskChart = null;
        let statsChart = null;

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#4a5568',
                        font: {
                            family: 'Inter',
                            size: 12,
                            weight: 600
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#4a5568',
                    bodyColor: '#4a5568',
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        family: 'Poppins',
                        size: 14,
                        weight: 600
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 13
                    }
                }
            }
        };

        if (taskDistRef.current) {
            taskChart = new Chart(taskDistRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'In Progress', 'Pending'],
                    datasets: [{
                        data: [186, 38, 24],
                        backgroundColor: [
                            'rgba(168, 237, 234, 0.8)',
                            'rgba(166, 193, 238, 0.8)',
                            'rgba(252, 182, 159, 0.8)'
                        ],
                        borderColor: [
                            'rgba(255, 255, 255, 0.8)',
                            'rgba(255, 255, 255, 0.8)',
                            'rgba(255, 255, 255, 0.8)'
                        ],
                        borderWidth: 3
                    }]
                },
                options: {
                    ...chartOptions,
                    cutout: '65%'
                }
            });
        }

        if (completionStatsRef.current) {
            statsChart = new Chart(completionStatsRef.current, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Completed Tasks',
                        data: [45, 52, 38, 65, 58, 72],
                        backgroundColor: 'rgba(168, 237, 234, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.8)',
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    ...chartOptions,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#718096',
                                font: {
                                    family: 'Inter',
                                    size: 11
                                }
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.3)',
                                drawBorder: false
                            }
                        },
                        x: {
                            ticks: {
                                color: '#718096',
                                font: {
                                    family: 'Inter',
                                    size: 11,
                                    weight: 600
                                }
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        return () => {
            if (taskChart) taskChart.destroy();
            if (statsChart) statsChart.destroy();
        };
    }, []);

    const handleAddTask = (e) => {
        e.preventDefault();
        alert('Task added successfully! (Demo)');
        setIsModalOpen(false);
    };

    const handleDeleteTask = (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            setTasks(tasks.filter(t => t.id !== id));
        }
    };

    const handleEditTask = () => {
        alert('Edit task functionality (Demo)');
    };

    const toggleUserMenu = () => {
        alert('User menu toggle (Demo)');
    };

    return (
        <div className="dashboard-container">
            <div className="app-container">
                {/* Sidebar */}
                <aside className={`sidebar glass ${isSidebarActive ? 'active' : ''}`} id="sidebar">
                    <div className="sidebar-header">
                        <div className="logo">DT</div>
                        <span className="logo-text">TalentHub</span>
                    </div>
                    <nav>
                        <ul className="nav-menu">
                            <li className="nav-item">
                                <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Dashboard
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/tasks" className={`nav-link ${location.pathname === '/tasks' ? 'active' : ''}`}>
                                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Tasks
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/team" className={`nav-link ${location.pathname === '/team' ? 'active' : ''}`}>
                                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Team
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/reports" className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`}>
                                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Reports
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/settings" className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}>
                                    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Settings
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    {/* Top Navigation */}
                    <div className="top-nav glass-strong">
                        <div className="search-container">
                            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search tasks, users, or projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="top-nav-right">
                            <div className="icon-btn" onClick={() => setIsSidebarActive(!isSidebarActive)}>
                                <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="notification-badge">5</span>
                            </div>
                            <div className="user-profile" onClick={toggleUserMenu}>
                                <div className="user-avatar">SM</div>
                                <div className="user-info">
                                    <div className="user-name">Sarah Miller</div>
                                    <div className="user-role">Admin</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="summary-grid">
                        <div className="summary-card glass-strong" style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)' }}>
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="card-label">Total Tasks</div>
                            <div className="card-value">{metrics.total}</div>
                            <div className="card-trend">
                                <span>Real-time</span> tracked tasks
                            </div>
                        </div>

                        <div className="summary-card glass-strong" style={{ background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.3) 0%, rgba(56, 249, 215, 0.3) 100%)' }}>
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="card-label">Completed Tasks</div>
                            <div className="card-value">{metrics.completed}</div>
                            <div className="card-trend">
                                <span>Real-time</span> completed metrics
                            </div>
                        </div>

                        <div className="summary-card glass-strong" style={{ background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.3) 0%, rgba(0, 242, 254, 0.3) 100%)' }}>
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="card-label">Pending Tasks</div>
                            <div className="card-value">{metrics.pending}</div>
                            <div className="card-trend">
                                <span>Real-time</span> active tasks
                            </div>
                        </div>

                        <div className="summary-card glass-strong" style={{ background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.3) 0%, rgba(245, 87, 108, 0.3) 100%)' }}>
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="card-label">Completion Rate</div>
                            <div className="card-value">{metrics.rate}%</div>
                            <div className="card-trend">
                                <span>Real-time</span> efficiency
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="dashboard-grid">
                        {/* Task Management Section */}
                        <div className="section-card glass-strong">
                            <div className="section-header">
                                <h2 className="section-title">Task Management</h2>
                                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                                    <span>+ Add Task</span>
                                </button>
                            </div>

                            <div className="filters">
                                <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <select className="filter-select" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                                    <option value="all">All Users</option>
                                    <option value="john">John Doe</option>
                                    <option value="sarah">Sarah Miller</option>
                                    <option value="mike">Mike Johnson</option>
                                </select>
                            </div>

                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Task Name</th>
                                            <th>Assigned To</th>
                                            <th>Deadline</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks
                                            .filter(t => (statusFilter === 'all' || t.status === statusFilter) &&
                                                (userFilter === 'all' || (t.user || '').toLowerCase() === userFilter) &&
                                                (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    (t.assignedTo || '').toLowerCase().includes(searchTerm.toLowerCase())))
                                            .map((task) => (
                                                <tr key={task.id}>
                                                    <td>{task.name}</td>
                                                    <td>{task.assignedTo || task.userName}</td>
                                                    <td>{task.deadline}</td>
                                                    <td>
                                                        <span className={`status-badge status-${task.status}`}>
                                                            {task.status === 'completed' ? 'Completed' : task.status === 'progress' ? 'In Progress' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button className="btn-icon" onClick={handleEditTask}>
                                                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button className="btn-icon" onClick={() => handleDeleteTask(task.id)}>
                                                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Activity Panel */}
                        <div className="section-card glass-strong">
                            <div className="section-header">
                                <h2 className="section-title">Recent Activity</h2>
                            </div>
                            <div className="activity-list">
                                <div className="activity-item">
                                    <div className="activity-avatar">SM</div>
                                    <div className="activity-content">
                                        <div className="activity-text">
                                            <strong>Sarah Miller</strong> completed "User Authentication Module"
                                        </div>
                                        <div className="activity-time">2 minutes ago</div>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-avatar" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>JD</div>
                                    <div className="activity-content">
                                        <div className="activity-text">
                                            <strong>John Doe</strong> updated task status to "In Progress"
                                        </div>
                                        <div className="activity-time">15 minutes ago</div>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-avatar" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>MJ</div>
                                    <div className="activity-content">
                                        <div className="activity-text">
                                            <strong>Mike Johnson</strong> submitted a new task
                                        </div>
                                        <div className="activity-time">1 hour ago</div>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-avatar" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>EW</div>
                                    <div className="activity-content">
                                        <div className="activity-text">
                                            <strong>Emily White</strong> commented on "API Integration"
                                        </div>
                                        <div className="activity-time">2 hours ago</div>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-avatar" style={{ background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)' }}>DL</div>
                                    <div className="activity-content">
                                        <div className="activity-text">
                                            <strong>David Lee</strong> assigned task to John Doe
                                        </div>
                                        <div className="activity-time">3 hours ago</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Section */}
                    <div className="analytics-grid">
                        <div className="section-card glass-strong">
                            <div className="section-header">
                                <h2 className="section-title">Task Distribution</h2>
                            </div>
                            <div className="chart-container">
                                <canvas id="taskDistributionChart" ref={taskDistRef}></canvas>
                            </div>
                        </div>

                        <div className="section-card glass-strong">
                            <div className="section-header">
                                <h2 className="section-title">Monthly Completion Stats</h2>
                            </div>
                            <div className="chart-container">
                                <canvas id="completionStatsChart" ref={completionStatsRef}></canvas>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Add Task Modal */}
            {isModalOpen && (
                <div className="modal active" onClick={(e) => {
                    if (e.target.className === 'modal active') setIsModalOpen(false);
                }}>
                    <div className="modal-content glass-strong">
                        <div className="modal-header">
                            <h3 className="modal-title">Add New Task</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAddTask}>
                            <div className="form-group">
                                <label className="form-label">Task Name</label>
                                <input type="text" className="form-input" placeholder="Enter task name" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Assign To</label>
                                <select className="form-select" required defaultValue="">
                                    <option value="" disabled>Select user</option>
                                    <option value="john">John Doe</option>
                                    <option value="sarah">Sarah Miller</option>
                                    <option value="mike">Mike Johnson</option>
                                    <option value="emily">Emily White</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Deadline</label>
                                <input type="date" className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-select" required defaultValue="pending">
                                    <option value="pending">Pending</option>
                                    <option value="progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Add Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button className="fab" onClick={() => setIsModalOpen(true)}>+</button>
        </div>
    );
}
