import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Chart from 'chart.js/auto';
import axios from 'axios';
import './Dashboard.css';
import CustomDropdown from '../Components/CustomDropdown';



export default function Dashboard() {
    const { searchTerm } = useOutletContext() || { searchTerm: '' };
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
                    labels: { color: '#cbd5e1', font: { family: 'Inter', size: 12, weight: 600 }, padding: 20, usePointStyle: true, pointStyle: 'circle' }
                },
                tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.95)', titleColor: '#f8fafc', bodyColor: '#cbd5e1', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, padding: 12, cornerRadius: 8 }
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
                        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(236, 72, 153, 0.8)'],
                        borderColor: ['rgba(15, 23, 42, 1)', 'rgba(15, 23, 42, 1)', 'rgba(15, 23, 42, 1)'],
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
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    ...chartOptions,
                    scales: {
                        y: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false } },
                        x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
                    }
                }
            });
        }

        return () => {
            if (taskChart) taskChart.destroy();
            if (statsChart) statsChart.destroy();
        };
    }, [tasks]);

    const toggleUserMenu = () => {
        alert('User menu toggle (Demo)');
    };

    return (
        <>
            {/* Summary Cards */}
                    <div className="summary-grid">
                        <div className="summary-card glass-strong" style={{ borderLeft: '4px solid #8b5cf6' }}>
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
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

                        <div className="summary-card glass-strong" style={{ borderLeft: '4px solid #10b981' }}>
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
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

                        <div className="summary-card glass-strong" style={{ borderLeft: '4px solid #ec4899' }}>
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #e11d48 100%)' }}>
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

                        <div className="summary-card glass-strong" style={{ borderLeft: '4px solid #06b6d4' }}>
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)' }}>
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
                            </div>

                            <div className="filters">
                                <CustomDropdown 
                                    value={statusFilter} 
                                    onChange={setStatusFilter} 
                                    placeholder="All Status"
                                    options={[
                                        { value: 'all', label: 'All Status' },
                                        { value: 'pending', label: 'Pending' },
                                        { value: 'progress', label: 'In Progress' },
                                        { value: 'completed', label: 'Completed' }
                                    ]} 
                                />
                                <CustomDropdown 
                                    value={userFilter} 
                                    onChange={setUserFilter} 
                                    placeholder="All Users"
                                    options={[
                                        { value: 'all', label: 'All Users' },
                                        ...Array.from(new Set(tasks.map(t => t.assignedTo || t.userName || t.user).filter(Boolean))).map(name => ({
                                            value: name.toLowerCase(),
                                            label: name
                                        }))
                                    ]}
                                />
                            </div>

                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Task Name</th>
                                            <th>Assigned To</th>
                                            <th>Deadline</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks
                                            .filter(t => (statusFilter === 'all' || t.status === statusFilter) &&
                                                (userFilter === 'all' || (t.assignedTo || t.userName || t.user || '').toLowerCase() === userFilter) &&
                                                (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    (t.assignedTo || '').toLowerCase().includes(searchTerm.toLowerCase())))
                                            .map((task) => (
                                                <tr key={task.id}>
                                                    <td>{task.name}</td>
                                                    <td>{task.assignedTo || task.userName}</td>
                                                    <td>{task.deadline && task.deadline !== 'TBD' ? new Date(task.deadline).toISOString().split('T')[0] : 'TBD'}</td>
                                                    <td>
                                                        <span className={`status-badge status-${task.status}`}>
                                                            {task.status === 'completed' ? 'Completed' : task.status === 'progress' ? 'In Progress' : 'Pending'}
                                                        </span>
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
                                        'var(--primary-gradient)',
                                        'var(--secondary-gradient)',
                                        'var(--success-gradient)',
                                        'var(--warning-gradient)',
                                        'var(--teal-gradient)'
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
           
        </>
    );
}
