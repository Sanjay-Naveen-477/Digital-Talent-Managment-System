import React, { useState, useEffect } from 'react';
import './Team.css';

export default function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const initialMembers = [
    { 
      id: 1, 
      name: "John Doe", 
      email: "john@example.com", 
      role: "Senior Developer", 
      department: "Engineering",
      assignedTasks: 3,
      completedTasks: 5
    },
    { 
      id: 2, 
      name: "Sarah Miller", 
      email: "sarah@example.com", 
      role: "Project Manager", 
      department: "Management",
      assignedTasks: 5,
      completedTasks: 8
    },
    { 
      id: 3, 
      name: "Mike Johnson", 
      email: "mike@example.com", 
      role: "QA Engineer", 
      department: "Quality Assurance",
      assignedTasks: 4,
      completedTasks: 10
    },
    { 
      id: 4, 
      name: "Emily Brown", 
      email: "emily@example.com", 
      role: "UI/UX Designer", 
      department: "Design",
      assignedTasks: 2,
      completedTasks: 6
    },
    { 
      id: 5, 
      name: "Alex Smith", 
      email: "alex@example.com", 
      role: "Backend Developer", 
      department: "Engineering",
      assignedTasks: 3,
      completedTasks: 7
    }
  ];

  useEffect(() => {
    setTeamMembers(initialMembers);
  }, []);

  useEffect(() => {
    let filtered = teamMembers;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  }, [teamMembers, searchTerm]);

  const handleSelectMember = (id) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMembers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map(member => member.id)));
    }
  };

  const handleDeleteMember = (id) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(teamMembers.filter(member => member.id !== id));
      const newSelected = new Set(selectedMembers);
      newSelected.delete(id);
      setSelectedMembers(newSelected);
    }
  };

  const handleAddMember = () => {
    if (!formData.name || !formData.email || !formData.role || !formData.department) {
      setError('Please fill all fields');
      return;
    }

    if (editingId) {
      setTeamMembers(teamMembers.map(member =>
        member.id === editingId
          ? { ...member, ...formData }
          : member
      ));
      setEditingId(null);
    } else {
      const newMember = {
        id: Math.max(...teamMembers.map(m => m.id), 0) + 1,
        ...formData,
        assignedTasks: 0,
        completedTasks: 0
      };
      setTeamMembers([...teamMembers, newMember]);
    }

    setFormData({ name: '', email: '', role: '', department: '' });
    setIsAddModalOpen(false);
    setError('');
  };

  const handleEditMember = (member) => {
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department
    });
    setEditingId(member.id);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', email: '', role: '', department: '' });
    setError('');
  };

  const departmentColors = {
    'Engineering': '#3b82f6',
    'Management': '#8b5cf6',
    'Quality Assurance': '#ec4899',
    'Design': '#f59e0b',
    'Marketing': '#06b6d4'
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Team Management</h1>

      <div style={styles.controlsBar}>
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        <div style={styles.buttonGroup}>
          {selectedMembers.size > 0 && (
            <button
              onClick={() => {
                if (confirm(`Remove ${selectedMembers.size} member(s)?`)) {
                  setTeamMembers(teamMembers.filter(m => !selectedMembers.has(m.id)));
                  setSelectedMembers(new Set());
                }
              }}
              style={{ ...styles.deleteButton, marginRight: '10px' }}
            >
              Remove Selected ({selectedMembers.size})
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={styles.addButton}
          >
            + Add Member
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
                  checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                  onChange={handleSelectAll}
                  style={styles.checkbox}
                />
              </th>
              <th style={styles.nameCell}>NAME</th>
              <th style={styles.emailCell}>EMAIL</th>
              <th style={styles.roleCell}>ROLE</th>
              <th style={styles.departmentCell}>DEPARTMENT</th>
              <th style={styles.tasksCell}>ASSIGNED TASKS</th>
              <th style={styles.completedCell}>COMPLETED</th>
              <th style={styles.actionsCell}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id} style={styles.bodyRow}>
                <td style={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={selectedMembers.has(member.id)}
                    onChange={() => handleSelectMember(member.id)}
                    style={styles.checkbox}
                  />
                </td>
                <td style={styles.nameCell}>
                  <div style={styles.memberInfo}>
                    <div style={styles.avatar}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>{member.name}</div>
                  </div>
                </td>
                <td style={styles.emailCell}>{member.email}</td>
                <td style={styles.roleCell}>{member.role}</td>
                <td style={styles.departmentCell}>
                  <span style={{
                    ...styles.departmentBadge,
                    backgroundColor: (departmentColors[member.department] || '#6b7280') + '20',
                    color: departmentColors[member.department] || '#6b7280',
                    borderColor: departmentColors[member.department] || '#6b7280'
                  }}>
                    {member.department}
                  </span>
                </td>
                <td style={styles.tasksCell}>
                  <span style={styles.taskCount}>{member.assignedTasks}</span>
                </td>
                <td style={styles.completedCell}>
                  <span style={styles.completedCount}>{member.completedTasks}</span>
                </td>
                <td style={styles.actionsCell}>
                  <button
                    onClick={() => handleEditMember(member)}
                    style={styles.editButton}
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
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
        {filteredMembers.length === 0 && (
          <div style={styles.noData}>
            {teamMembers.length === 0 ? 'No team members yet' : 'No results found'}
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingId ? 'Edit Team Member' : 'Add New Team Member'}
            </h2>

            {error && <div style={styles.errorMessage}>{error}</div>}

            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., Senior Developer"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                style={styles.input}
              >
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Management">Management</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
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
                onClick={handleAddMember}
                style={styles.submitButton}
              >
                {editingId ? 'Update Member' : 'Add Member'}
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
  searchInput: {
    flex: '1',
    minWidth: '250px',
    padding: '10px 15px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
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
    backgroundColor: '#ef4444',
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
  nameCell: {
    padding: '15px 20px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a202c'
  },
  emailCell: {
    padding: '15px 15px',
    fontSize: '14px',
    color: '#4b5563'
  },
  roleCell: {
    padding: '15px 15px',
    fontSize: '14px',
    color: '#4b5563'
  },
  departmentCell: {
    padding: '15px 15px',
    textAlign: 'center'
  },
  tasksCell: {
    padding: '15px 15px',
    textAlign: 'center'
  },
  completedCell: {
    padding: '15px 15px',
    textAlign: 'center'
  },
  actionsCell: {
    padding: '15px 20px',
    textAlign: 'center',
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  memberInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#7c3aed',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  departmentBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid',
    whiteSpace: 'nowrap'
  },
  taskCount: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  completedCount: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
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
