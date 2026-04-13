import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import CustomDropdown from '../Components/CustomDropdown';
import './Reports.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const defaultSummary = {
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  completionRate: 0,
};

const defaultInsights = [
  { icon: 'ℹ️', text: 'Loading insights...', trend: 'up' }
];

const defaultUserPerformance = [];
const defaultTaskReports = [];
const defaultActivityTimeline = [];


export default function Reports() {
  const [summaryMetrics, setSummaryMetrics] = useState(defaultSummary);
  const [insights, setInsights] = useState(defaultInsights);
  const [userPerformance, setUserPerformance] = useState(defaultUserPerformance);
  const [taskReports, setTaskReports] = useState(defaultTaskReports);
  const [activityTimeline, setActivityTimeline] = useState(defaultActivityTimeline);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterUser, setFilterUser] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/reports`);
        if (response.data.status === 'success' && response.data.data) {
          const payload = response.data.data;
          setSummaryMetrics(payload.summary);
          setInsights(payload.insights);
          setUserPerformance(payload.userPerformance);
          setTaskReports(payload.taskReports);
          setActivityTimeline(payload.activityTimeline);
          setError('');
        } else {
          setError('Unable to load reports from backend.');
        }
      } catch (err) {
        setError('Unable to fetch reports. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  const filteredTasks = useMemo(() => {
    return taskReports.filter(task => {
      if (filterStatus !== 'All' && task.status !== filterStatus) return false;
      if (filterUser !== 'All' && task.assignee !== filterUser) return false;
      return true;
    });
  }, [taskReports, filterStatus, filterUser]);

  const pieChartData = useMemo(() => ({
    labels: ['Completed', 'In Progress', 'Pending/Delayed'],
    datasets: [
      {
        data: [
          summaryMetrics.completedTasks,
          Math.max(summaryMetrics.totalTasks - summaryMetrics.completedTasks - summaryMetrics.pendingTasks, 0),
          summaryMetrics.pendingTasks
        ],
        backgroundColor: ['#10b981', '#6366f1', '#f43f5e'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  }), [summaryMetrics]);

  const barChartData = useMemo(() => ({
    labels: userPerformance.map((u) => u.name),
    datasets: [
      {
        label: 'Tasks Completed',
        data: userPerformance.map((u) => u.completed),
        backgroundColor: '#4f46e5',
        borderRadius: 4,
      },
      {
        label: 'Tasks Assigned',
        data: userPerformance.map((u) => u.assigned),
        backgroundColor: '#e0e7ff',
        borderRadius: 4,
      }
    ]
  }), [userPerformance]);

  const lineChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const timelineByDay = days.map((day) => ({ day, completed: 0 }));

    activityTimeline.forEach((event) => {
      const created = new Date(event.time);
      const dayName = created.toLocaleDateString('en-US', { weekday: 'short' });
      const idx = days.indexOf(dayName);
      if (idx >= 0 && event.type === 'completion') {
        timelineByDay[idx].completed += 1;
      }
    });

    return {
      labels: days,
      datasets: [
        {
          label: 'Task Completions',
          data: timelineByDay.map((day) => day.completed),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    };
  }, [activityTimeline]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: '#cbd5e1',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#cbd5e1', font: { family: "'Inter', sans-serif" } }
      },
      tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.95)', titleColor: '#f8fafc', bodyColor: '#cbd5e1', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1 }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)', borderDash: [4, 4] } }
    }
  };

  if (loading) {
    return (
      <div className="reports-container dashboard-page">
        <p>Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container dashboard-page">
        <p className="text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="reports-container dashboard-page">
      <div className="reports-header flex-between">
        <div>
          <h1>System Analytics & Reports</h1>
          <p>Comprehensive overview of task performance and user productivity.</p>
        </div>
      
      </div>

      {/* 1. Top Summary Cards */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon blue">📋</div>
          <div className="metric-content">
            <p className="metric-label">Total Tasks</p>
            <h2 className="metric-value">{summaryMetrics.totalTasks}</h2>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon green">✅</div>
          <div className="metric-content">
            <p className="metric-label">Completed Tasks</p>
            <h2 className="metric-value">{summaryMetrics.completedTasks}</h2>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon orange">⏳</div>
          <div className="metric-content">
            <p className="metric-label">Pending Tasks</p>
            <h2 className="metric-value">{summaryMetrics.pendingTasks}</h2>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon purple">📈</div>
          <div className="metric-content">
            <p className="metric-label">Completion Rate</p>
            <h2 className="metric-value">{summaryMetrics.completionRate}%</h2>
          </div>
        </div>
      </section>

      {/* 7. Insights / Highlights */}
      <section className="insights-container">
        {insights.map((insight, idx) => (
          <div className="insight-card" key={idx}>
            <span className="insight-icon">{insight.icon}</span>
            <span className="insight-text">{insight.text}</span>
            <span className={`insight-trend ${insight.trend === 'up' ? 'positive' : 'negative'}`}>
              {insight.trend === 'up' ? '▲' : '▼'}
            </span>
          </div>
        ))}
      </section>

      {/* 2. Task Analytics Charts */}
      <section className="charts-grid">
        <div className="chart-card">
          <h3>Task Status Distribution</h3>
          <div className="chart-wrapper pie-wrapper">
            <Pie data={pieChartData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card chart-span-2">
          <h3>User Workload & Productivity</h3>
          <div className="chart-wrapper bar-wrapper">
            <Bar data={barChartData} options={barOptions} />
          </div>
        </div>
        <div className="chart-card chart-span-3">
          <h3>Task Completions Over Time</h3>
          <div className="chart-wrapper line-wrapper">
            <Line data={lineChartData} options={barOptions} />
          </div>
        </div>
      </section>

      {/* Dashboard Lower Half */}
      <div className="reports-lower-grid">
        <div className="reports-main-col">
          
          {/* 3. User Performance Table */}
          <section className="table-section">
            <h3>User Performance Evaluation</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Assigned</th>
                    <th>Completed</th>
                    <th>Completion %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userPerformance.map(user => (
                    <tr key={user.id}>
                      <td className="fw-500">{user.name}</td>
                      <td>{user.assigned}</td>
                      <td>{user.completed}</td>
                      <td>
                        <div className="progress-cell">
                          <span className="progress-text">{user.rate}%</span>
                          <div className="progress-bar-bg">
                            <div 
                              className={`progress-bar-fill ${user.rate < 50 ? 'bg-danger' : 'bg-success'}`}
                              style={{width: `${user.rate}%`}}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${user.status === 'Active' ? 'badge-active' : 'badge-warning'}`}>
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. & 5. Filters and Task Report Table */}
          <section className="table-section">
            <div className="flex-between mb-4">
              <h3>Detailed Task Reports</h3>
              <div className="filters-group" style={{ display: 'flex', gap: '10px' }}>
                <CustomDropdown
                  value={filterUser}
                  onChange={setFilterUser}
                  options={[
                    { label: 'All Users', value: 'All' },
                    ...userPerformance.map(u => ({ label: u.name, value: u.name }))
                  ]}
                  placeholder="All Users"
                  style={{ minWidth: '150px' }}
                />
                <CustomDropdown
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { label: 'All Statuses', value: 'All' },
                    { label: 'Completed', value: 'Completed' },
                    { label: 'In Progress', value: 'In Progress' },
                    { label: 'Pending', value: 'Pending' },
                    { label: 'Delayed', value: 'Delayed' }
                  ]}
                  placeholder="All Statuses"
                  style={{ minWidth: '150px' }}
                />
              </div>
            </div>
            
            <div className="table-responsive">
              <table className="data-table task-table">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Assigned To</th>
                  
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length > 0 ? filteredTasks.map(task => (
                    <tr key={task.id}>
                      <td className="fw-500">{task.name}</td>
                      <td>
                        <div className="avatar-text">
                          <div className="mini-avatar">{task.assignee.charAt(0)}</div>
                          {task.assignee}
                        </div>
                      </td>
                      
                      <td>
                        <span className={`priority-dot p-${task.priority.toLowerCase()}`}></span>
                        {task.priority}
                      </td>
                      <td>
                        <span className={`status-badge s-${task.status.toLowerCase().replace(' ', '-')}`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">No tasks match the selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
        
        {/* 6. Activity Timeline (Sidebar) */}
        <aside className="timeline-sidebar">
          <h3>Activity Timeline</h3>
          <div className="timeline-container">
            {activityTimeline.map(item => (
              <div className="timeline-item" key={item.id}>
                <div className={`timeline-dot t-${item.type}`}></div>
                <div className="timeline-content">
                  <p className="timeline-text">{item.text}</p>
                  <span className="timeline-time">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-secondary full-width mt-4">View Full History</button>
        </aside>
      </div>

    </div>
  );
}
