import React, { useState } from 'react';
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

// --- MOCK DATA ---
const SUMMARY_METRICS = {
  totalTasks: 124,
  completedTasks: 82,
  pendingTasks: 42,
  completionRate: 66,
};

const INSIGHTS = [
  { icon: '🏆', text: 'Most productive user: Sanjay', trend: 'up' },
  { icon: '⚠️', text: 'Tasks delayed: 5 (High Priority)', trend: 'down' },
  { icon: '📈', text: 'Completion rate increased by 12% this week', trend: 'up' },
];

const USER_PERFORMANCE = [
  { id: 1, name: 'Sanjay', assigned: 45, completed: 38, rate: 84, status: 'Active' },
  { id: 2, name: 'Anita', assigned: 30, completed: 25, rate: 83, status: 'Active' },
  { id: 3, name: 'Rahul', assigned: 25, completed: 10, rate: 40, status: 'Low Performance' },
  { id: 4, name: 'Priya', assigned: 24, completed: 9, rate: 37, status: 'Low Performance' },
];

const TASK_REPORTS = [
  { id: 'T-101', name: 'Design Onboarding Flow', assignee: 'Sanjay', deadline: '2026-03-25', status: 'Completed', priority: 'High' },
  { id: 'T-102', name: 'Database Migration', assignee: 'Rahul', deadline: '2026-03-22', status: 'Delayed', priority: 'Critical' },
  { id: 'T-103', name: 'Update Dashboard UI', assignee: 'Anita', deadline: '2026-03-28', status: 'In Progress', priority: 'Medium' },
  { id: 'T-104', name: 'Fix Login Bug', assignee: 'Priya', deadline: '2026-03-24', status: 'Pending', priority: 'High' },
  { id: 'T-105', name: 'Create API Docs', assignee: 'Sanjay', deadline: '2026-03-30', status: 'In Progress', priority: 'Low' },
];

const ACTIVITY_TIMELINE = [
  { id: 1, time: '2 hours ago', type: 'completion', text: 'Sanjay completed "Design Onboarding Flow"' },
  { id: 2, time: '5 hours ago', type: 'late', text: 'Rahul missed deadline for "Database Migration"' },
  { id: 3, time: 'Yesterday', type: 'new', text: 'New task "Fix Login Bug" assigned to Priya' },
];

// --- CHART DATA CONFIG ---
const pieChartData = {
  labels: ['Completed', 'In Progress', 'Pending/Delayed'],
  datasets: [
    {
      data: [82, 27, 15],
      backgroundColor: ['#10b981', '#6366f1', '#f43f5e'],
      borderWidth: 0,
      hoverOffset: 4
    },
  ],
};

const barChartData = {
  labels: ['Sanjay', 'Anita', 'Rahul', 'Priya'],
  datasets: [
    {
      label: 'Tasks Completed',
      data: [38, 25, 10, 9],
      backgroundColor: '#4f46e5',
      borderRadius: 4,
    },
    {
      label: 'Tasks Assigned',
      data: [45, 30, 25, 24],
      backgroundColor: '#e0e7ff',
      borderRadius: 4,
    }
  ],
};

const lineChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Task Completions',
      data: [5, 9, 14, 12, 22, 10, 10],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4, // smooth curves
    }
  ]
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { family: "'Inter', sans-serif" } }
    }
  }
};

const barOptions = {
  ...chartOptions,
  scales: {
    x: { grid: { display: false } },
    y: { grid: { borderDash: [4, 4] } }
  }
};

export default function Reports() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterUser, setFilterUser] = useState('All');

  // Simple filtering logic
  const filteredTasks = TASK_REPORTS.filter(task => {
    if (filterStatus !== 'All' && task.status !== filterStatus) return false;
    if (filterUser !== 'All' && task.assignee !== filterUser) return false;
    return true;
  });

  return (
    <div className="reports-container">
      <div className="reports-header flex-between">
        <div>
          <h1>System Analytics & Reports</h1>
          <p>Comprehensive overview of task performance and user productivity.</p>
        </div>
        <button className="btn-export">
          <span>📥</span> Export Report (PDF/CSV)
        </button>
      </div>

      {/* 1. Top Summary Cards */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon blue">📋</div>
          <div className="metric-content">
            <p className="metric-label">Total Tasks</p>
            <h2 className="metric-value">{SUMMARY_METRICS.totalTasks}</h2>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon green">✅</div>
          <div className="metric-content">
            <p className="metric-label">Completed Tasks</p>
            <h2 className="metric-value">{SUMMARY_METRICS.completedTasks}</h2>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon orange">⏳</div>
          <div className="metric-content">
            <p className="metric-label">Pending Tasks</p>
            <h2 className="metric-value">{SUMMARY_METRICS.pendingTasks}</h2>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon purple">📈</div>
          <div className="metric-content">
            <p className="metric-label">Completion Rate</p>
            <h2 className="metric-value">{SUMMARY_METRICS.completionRate}%</h2>
          </div>
        </div>
      </section>

      {/* 7. Insights / Highlights */}
      <section className="insights-container">
        {INSIGHTS.map((insight, idx) => (
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
                  {USER_PERFORMANCE.map(user => (
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
              <div className="filters-group">
                <input type="date" className="filter-input" title="Date Range Start" />
                <span className="filter-divider">-</span>
                <input type="date" className="filter-input" title="Date Range End" />
                
                <select 
                  className="filter-input"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                >
                  <option value="All">All Users</option>
                  <option value="Sanjay">Sanjay</option>
                  <option value="Anita">Anita</option>
                  <option value="Rahul">Rahul</option>
                  <option value="Priya">Priya</option>
                </select>
                
                <select 
                  className="filter-input"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>
            </div>
            
            <div className="table-responsive">
              <table className="data-table task-table">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Assigned To</th>
                    <th>Deadline</th>
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
                      <td>{task.deadline}</td>
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
            {ACTIVITY_TIMELINE.map(item => (
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
