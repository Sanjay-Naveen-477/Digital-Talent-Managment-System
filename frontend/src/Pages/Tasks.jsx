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
    deadline: '',
    status: 'pending'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        return '#22c55e';
      case 'progress':
        return '#ec4899';
      case 'pending':
        return '#f97316';
      default:
        return '#6b7280';
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
      await axios.post(`${API_URL}/tasks/delete_batch`, { ids: idsToDelete });
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
        await axios.delete(`${API_URL}/tasks/${id}`);
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
    if (!formData.name || !formData.assignedTo || !formData.deadline) {
      setError('Please fill all fields');
      return;
    }

    try {
      if (editingId) {
        const response = await axios.put(`${API_URL}/tasks/${editingId}`, formData);
        if (response.data.status === "success") {
          setTasks(tasks.map(task =>
            task.id === editingId ? { ...task, ...response.data.task } : task
          ));
          toast.success('Task updated successfully', { id: 'crud' });
        }
        setEditingId(null);
      } else {
        const response = await axios.post(`${API_URL}/tasks`, formData);
        if (response.data.status === "success") {
          setTasks([...tasks, response.data.task]);
          toast.success('Task added successfully', { id: 'crud' });
        }
      }

      setFormData({ name: '', assignedTo: '', deadline: '', status: 'pending' });
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
      deadline: task.deadline,
      status: task.status
    });
    setEditingId(task.id);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', assignedTo: '', deadline: '', status: 'pending' });
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
          {selectedTasks.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              style={{ ...styles.deleteButton, marginRight: '10px' }}
            >
              Delete Selected ({selectedTasks.size})
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={styles.addButton}
          >
            + Add Task
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.checkboxCell}>
                <input
                  type="checkbox"
                  checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
                  onChange={handleSelectAll}
                  style={styles.checkbox}
                />
              </th>
              <th style={styles.taskNameCell}>TASK NAME</th>
              <th style={styles.assignedToCell}>ASSIGNED TO</th>
              <th style={styles.deadlineCell}>DEADLINE</th>
              <th style={styles.statusCell}>STATUS</th>
              <th style={styles.actionsCell}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} style={styles.bodyRow}>
                <td style={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(task.id)}
                    onChange={() => handleSelectTask(task.id)}
                    style={styles.checkbox}
                  />
                </td>
                <td style={styles.taskNameCell}>
                  {task.name}
                  {task.teamId && (
                    <span style={{fontSize: '11px', backgroundColor: '#e0e7ff', padding: '2px 6px', borderRadius: '4px', color: '#4338ca', marginLeft: '6px', whiteSpace: 'nowrap'}}>Team Task</span>
                  )}
                </td>
                <td style={styles.assignedToCell}>{task.assignedTo}</td>
                <td style={styles.deadlineCell}>{task.deadline}</td>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              <label style={styles.label}>Deadline</label>
              <input
                type="text"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                placeholder="e.g., Mar 25, 2026"
                style={styles.input}
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
    backgroundColor: '#f0f7ff',
    minHeight: '100vh',
    borderRadius: '16px',
    margin: '20px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '25px'
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
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
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
    backgroundColor: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
  },
  deleteButton: {
    padding: '10px 15px',
    backgroundColor: '#44ef4f',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  headerRow: {
    backgroundColor: '#f3f4f6',
    borderBottom: '2px solid #e5e7eb'
  },
  bodyRow: {
    borderBottom: '1px solid #e5e7eb',
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
    color: '#1a202c'
  },
  assignedToCell: {
    padding: '15px 15px',
    fontSize: '14px',
    color: '#4b5563'
  },
  deadlineCell: {
    padding: '15px 15px',
    fontSize: '14px',
    color: '#4b5563'
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
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    color: '#3b82f6',
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
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    color: '#ef4444',
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
    color: '#9ca3af',
    fontSize: '16px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  errorMessage: {
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#fee2e2',
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
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
