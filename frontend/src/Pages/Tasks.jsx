import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './Tasks.css';

const API_URL = "http://localhost:5000";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    assignedTo: '',
    status: 'pending',
    deadline: '',
    tags: '',
    description: ''
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const role = localStorage.getItem('userRole') || 'user';
  const isAdmin = role === 'admin';
  const apiHeaders = { headers: { 'X-User-Role': role } };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      if (response.data.status === "success") {
        setTasks(response.data.tasks);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      setError("Failed to load tasks from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = tasks;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (userFilter !== 'all') {
      filtered = filtered.filter(task => task.user === userFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, statusFilter, userFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'progress':
        return '#3b82f6';
      case 'pending':
        return '#ec4899';
      default:
        return '#cbd5e1';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const handleSelectTask = (id) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTasks.size === 0) return;
    
    try {
      const idsToDelete = Array.from(selectedTasks);
      await axios.post(`${API_URL}/tasks/delete_batch`, { ids: idsToDelete }, apiHeaders);
      const newTasks = tasks.filter(task => !selectedTasks.has(task.id));
      setTasks(newTasks);
      setSelectedTasks(new Set());
      toast.success('Tasks deleted successfully', { id: 'crud' });
    } catch (err) {
      console.error("Failed to delete tasks", err);
      toast.error('Failed to delete selected tasks', { id: 'crud' });
    }
  };

  const handleDeleteTask = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}/tasks/${id}`, apiHeaders);
        setTasks(tasks.filter(task => task.id !== id));
        const newSelected = new Set(selectedTasks);
        newSelected.delete(id);
        setSelectedTasks(newSelected);
        toast.success('Task deleted successfully', { id: 'crud' });
      } catch (err) {
        console.error("Failed to delete task", err);
        toast.error('Failed to delete task', { id: 'crud' });
      }
    }
  };

  const handleAddTask = async () => {
    if (!formData.name.trim() || !formData.assignedTo.trim() || !formData.deadline.trim() || !formData.description.trim() || !formData.tags.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (Number.isNaN(Date.parse(formData.deadline))) {
      setError('Please enter a valid due date.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      assignedTo: formData.assignedTo.trim(),
      status: formData.status,
      deadline: new Date(formData.deadline).toISOString(),
      tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      description: formData.description.trim()
    };

    try {
      if (editingId) {
        const response = await axios.put(`${API_URL}/tasks/${editingId}`, payload, apiHeaders);
        if (response.data.status === "success") {
          setTasks(tasks.map(task =>
            task.id === editingId ? { ...task, ...response.data.task } : task
          ));
          toast.success('Task updated successfully', { id: 'crud' });
        }
        setEditingId(null);
      } else {
        const response = await axios.post(`${API_URL}/tasks`, payload, apiHeaders);
        if (response.data.status === "success") {
          setTasks([...tasks, response.data.task]);
          toast.success('Task added successfully', { id: 'crud' });
        }
      }

      setFormData({ name: '', assignedTo: '', status: 'pending', deadline: '', tags: '', description: '' });
      setIsAddModalOpen(false);
      setError('');
    } catch (err) {
      console.error("Failed to save task", err);
      setError("Failed to communicate with the server");
    }
  };

  const handleEditTask = (task) => {
    setFormData({
      name: task.name,
      assignedTo: task.assignedTo,
      status: task.status,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
      tags: Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || ''),
      description: task.description || ''
    });
    setEditingId(task.id);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', assignedTo: '', status: 'pending' });
    setError('');
  };

  const uniqueUsers = [...new Set(tasks.map(task => task.user))];

  return (
    <div className="dashboard-page" style={styles.container}>
      <h1 style={styles.title}>Task Management</h1>

      <div style={styles.controlsBar}>
        <div style={styles.filtersContainer}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>
                {tasks.find(t => t.user === user)?.assignedTo}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.buttonGroup}>
          {isAdmin && selectedTasks.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              style={{ ...styles.deleteButton, marginRight: '10px' }}
            >
              Delete Selected ({selectedTasks.size})
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={styles.addButton}
            >
              + Add Task
            </button>
          )}
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              {isAdmin && (
                <th style={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
                    onChange={handleSelectAll}
                    style={styles.checkbox}
                  />
                </th>
              )}
              <th style={styles.taskNameCell}>TASK NAME</th>
              <th style={styles.descriptionCell}>DESCRIPTION</th>
              <th style={styles.assignedToCell}>ASSIGNED TO</th>
              <th style={styles.dateCell}>CREATED</th>
              <th style={styles.dateCell}>DUE DATE</th>
              <th style={styles.tagsCell}>TAGS</th>
              <th style={styles.statusCell}>STATUS</th>
              <th style={styles.actionsCell}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} style={styles.bodyRow}>
                {isAdmin && (
                  <td style={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={selectedTasks.has(task.id)}
                      onChange={() => handleSelectTask(task.id)}
                      style={styles.checkbox}
                    />
                  </td>
                )}
                <td style={styles.taskNameCell}>
                  {task.name}
                  {task.teamId && (
                    <span style={{fontSize: '11px', backgroundColor: '#e0e7ff', padding: '2px 6px', borderRadius: '4px', color: '#4338ca', marginLeft: '6px', whiteSpace: 'nowrap'}}>Team Task</span>
                  )}
                </td>
                <td style={styles.descriptionCell}>{task.description ? `${task.description.slice(0, 80)}${task.description.length > 80 ? '...' : ''}` : 'No description'}</td>
                <td style={styles.assignedToCell}>{task.assignedTo}</td>
                <td style={styles.dateCell}>{formatDate(task.createdAt)}</td>
                <td style={styles.dateCell}>{formatDate(task.deadline)}</td>
                <td style={styles.tagsCell}>{Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || '-')}</td>
                <td style={styles.statusCell}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(task.status) + '20',
                    color: getStatusColor(task.status),
                    borderColor: getStatusColor(task.status)
                  }}>
                    {getStatusLabel(task.status)}
                  </span>
                </td>
                <td style={styles.actionsCell}>
                  <button
                    onClick={() => openTaskModal(task)}
                    style={styles.viewButton}
                    title="View"
                  >
                    👁
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEditTask(task)}
                        style={styles.editButton}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        style={styles.deleteIconButton}
                        title="Delete"
                      >
                        🗑
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isModalOpen && selectedTask && (
          <div style={styles.modalOverlay} onClick={closeTaskModal}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalTitle}>{selectedTask.name}</h2>
              <p style={styles.modalText}><strong>Description:</strong> {selectedTask.description || 'No description provided.'}</p>
              <p style={styles.modalText}><strong>Assigned To:</strong> {selectedTask.assignedTo || 'Unassigned'}</p>
              <p style={styles.modalText}><strong>Status:</strong> {getStatusLabel(selectedTask.status)}</p>
              <p style={styles.modalText}><strong>Created:</strong> {formatDate(selectedTask.createdAt)}</p>
              <p style={styles.modalText}><strong>Due Date:</strong> {formatDate(selectedTask.deadline)}</p>
              <p style={styles.modalText}><strong>Tags:</strong> {Array.isArray(selectedTask.tags) ? selectedTask.tags.join(', ') : (selectedTask.tags || 'None')}</p>
              <div style={styles.modalButtons}>
                <button onClick={closeTaskModal} style={styles.cancelButton}>Close</button>
              </div>
            </div>
          </div>
        )}
        {filteredTasks.length === 0 && (
          <div style={styles.noData}>No tasks found</div>
        )}
      </div>

      {isAddModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingId ? 'Edit Task' : 'Add New Task'}
            </h2>

            {error && <div style={styles.errorMessage}>{error}</div>}

            <div style={styles.formGroup}>
              <label style={styles.label}>Task Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter task name"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Assigned To</label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="Enter assignee name"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Due Date</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tags / Category</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Frontend, Bug, AI, Urgent"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Task Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter a short description of the task"
                style={{ ...styles.input, minHeight: '80px' }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={styles.input}
              >
                <option value="pending">Pending</option>
                <option value="progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div style={styles.modalButtons}>
              <button
                onClick={handleCloseModal}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                style={styles.submitButton}
              >
                {editingId ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    backgroundColor: 'transparent',
    minHeight: '100vh',
    margin: '20px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: '25px',
    fontFamily: 'Poppins, sans-serif'
  },
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    gap: '20px',
    flexWrap: 'wrap'
  },
  filtersContainer: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },
  select: {
    padding: '10px 15px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(10px)',
    color: '#f8fafc',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    minWidth: '150px',
    transition: 'all 0.3s ease'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  addButton: {
    padding: '10px 20px',
    background: 'var(--primary-gradient)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
  },
  deleteButton: {
    padding: '10px 15px',
    background: 'var(--secondary-gradient)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  tableContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  headerRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  bodyRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background-color 0.2s ease'
  },
  checkboxCell: {
    padding: '15px 10px',
    textAlign: 'center',
    width: '50px'
  },
  taskNameCell: {
    padding: '15px 20px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#f8fafc'
  },
  assignedToCell: {
    padding: '15px 15px',
    fontSize: '14px',
    color: '#cbd5e1'
  },
  descriptionCell: {
    padding: '15px 15px',
    maxWidth: '240px',
    color: '#94a3b8',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  dateCell: {
    padding: '15px 15px',
    fontSize: '14px',
    color: '#cbd5e1',
    textAlign: 'center'
  },
  tagsCell: {
    padding: '15px 15px',
    fontSize: '14px',
    color: '#94a3b8'
  },
  statusCell: {
    padding: '15px 15px',
    textAlign: 'center'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid',
    whiteSpace: 'nowrap'
  },
  actionsCell: {
    padding: '15px 20px',
    textAlign: 'center',
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  editButton: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#60a5fa',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  viewButton: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#cbd5e1',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteIconButton: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    color: '#f43f5e',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '16px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f8fafc',
    borderRadius: '20px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: '20px'
  },
  modalText: {
    marginBottom: '12px',
    color: '#cbd5e1',
    lineHeight: '1.6'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    color: '#f8fafc',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  errorMessage: {
    color: '#fca5a5',
    fontSize: '14px',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    textAlign: 'center'
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '25px'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '10px 20px',
    background: 'var(--primary-gradient)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
  }
};
