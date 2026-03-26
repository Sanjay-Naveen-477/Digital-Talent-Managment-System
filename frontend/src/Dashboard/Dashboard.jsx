import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Chart from 'chart.js/auto';
import axios from 'axios';
import './Dashboard.css';

export default function Dashboard() {
    const { searchTerm } = useOutletContext() || { searchTerm: '' };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');

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
                    labels: { color: '#4a5568', font: { family: 'Inter', size: 12, weight: 600 }, padding: 20, usePointStyle: true, pointStyle: 'circle' }
                },
                tooltip: { backgroundColor: 'rgba(255, 255, 255, 0.95)', titleColor: '#4a5568', bodyColor: '#4a5568', borderColor: 'rgba(255, 255, 255, 0.4)', borderWidth: 1, padding: 12, cornerRadius: 8 }
            }
        };

        const completedCount = tasks.filter(t => t.status === 'completed' || t.status === 'Completed').length;
        const progressCount = tasks.filter(t => t.status === 'progress' || t.status === 'In Progress').length;
        const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'Pending').length;

        const monthCounts = { 'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0, 'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0 };
        tasks.forEach(t => {
            if (!t.deadline) return;
            const m = t.deadline.substring(0, 3);
            if (monthCounts[m] !== undefined && (t.status === 'completed' || t.status === 'Completed')) {
                monthCounts[m]++;
            }
        });
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const dataStats = labels.map(l => monthCounts[l] || 0);

        if (taskDistRef.current) {
            taskChart = new Chart(taskDistRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'In Progress', 'Pending'],
                    datasets: [{
                        data: [completedCount, progressCount, pendingCount],
                        backgroundColor: ['rgba(168, 237, 234, 0.8)', 'rgba(166, 193, 238, 0.8)', 'rgba(252, 182, 159, 0.8)'],
                        borderColor: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.8)'],
                        borderWidth: 3
                    }]
                },
                options: { ...chartOptions, cutout: '65%' }
            });
        }

        if (completionStatsRef.current) {
            statsChart = new Chart(completionStatsRef.current, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Completed Tasks',
                        data: dataStats,
                        backgroundColor: 'rgba(168, 237, 234, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.8)',
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    ...chartOptions,
                    scales: {
                        y: { beginAtZero: true, ticks: { color: '#718096' }, grid: { color: 'rgba(255, 255, 255, 0.3)', drawBorder: false } },
                        x: { ticks: { color: '#718096' }, grid: { display: false } }
                    }
                }
            });
        }

        return () => {
            if (taskChart) taskChart.destroy();
            if (statsChart) statsChart.destroy();
        };
    }, [tasks]);

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
        <>
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
                                {tasks.slice(-5).reverse().map((task, idx) => {
                                    const assignee = task.assignedTo || task.userName || 'Unassigned';
                                    const initials = assignee.length > 1 ? assignee.substring(0, 2).toUpperCase() : 'UA';
                                    const gradients = [
                                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                        'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
                                        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                    ];
                                    return (
                                        <div className="activity-item" key={task.id || idx}>
                                            <div className="activity-avatar" style={{ background: gradients[idx % gradients.length], color: 'white' }}>
                                                {initials}
                                            </div>
                                            <div className="activity-content">
                                                <div className="activity-text">
                                                    <strong>{assignee}</strong> {task.status === 'completed' || task.status === 'Completed' ? 'completed' : task.status === 'progress' || task.status === 'In Progress' ? 'is working on' : 'submitted'} "{task.name}"
                                                </div>
                                                <div className="activity-time">Recently</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {tasks.length === 0 && (
                                    <div style={{ color: '#718096', fontStyle: 'italic', padding: '10px' }}>No recent activity to show.</div>
                                )}
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
            {/* Floating Action Button */}
            <button className="fab" onClick={() => setIsModalOpen(true)}>+</button>
        </>
    );
}
