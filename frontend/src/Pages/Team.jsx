import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './Team.css';
import CustomDropdown from '../Components/CustomDropdown';

export default function Team() {
  const [role] = useState(() => localStorage.getItem('userRole') || 'user');
  const userEmail = localStorage.getItem('userEmail') || '';
  const userName = localStorage.getItem('userName') || '';
  const isAdmin = role === 'admin';
  const apiHeaders = { headers: { 'X-User-Role': role, 'X-User-Email': userEmail, 'X-User-Name': userName } };

  const [teams, setTeams] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [teamForm, setTeamForm] = useState({ name: '', lead: '', status: 'Active' });
  
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '', status: 'pending', description: '', dueDate: '', tags: '' });
  const [memberForm, setMemberForm] = useState({ name: '', role: '' });
  const [customRole, setCustomRole] = useState(false);
  
  const [error, setError] = useState('');
  const [openTaskDropdown, setOpenTaskDropdown] = useState(null);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    fetchTeamsAndTasks();
  }, []);

  const fetchTeamsAndTasks = async () => {
    try {
      const [teamsRes, tasksRes] = await Promise.all([
        axios.get('http://localhost:5000/teams'),
        axios.get('http://localhost:5000/tasks')
      ]);
      if (teamsRes.data.status === 'success') {
        const robustTeams = teamsRes.data.teams.map(t => ({ ...t, members: t.members || [] }));
        setTeams(robustTeams);
      }
      if (tasksRes.data.status === 'success') setAllTasks(tasksRes.data.tasks);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data from backend.', { id: 'crud' });
    }
  };

  const totalTeams = teams.length;
  const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);
  const activeTeams = teams.filter((team) => team.status === 'Active').length;
  const totalTeamTasks = allTasks.filter((t) => t.teamId !== undefined && t.teamId !== null).length;
  const averageTasksPerTeam = totalTeams ? Math.round(totalTeamTasks / totalTeams) : 0;

  const filteredTeams = useMemo(() => {
    const key = searchTerm.trim().toLowerCase();
    return teams.filter((team) => {
      const searchMatch =
        !key ||
        team.name?.toLowerCase().includes(key) ||
        team.lead?.toLowerCase().includes(key);
      const statusMatch = statusFilter === 'All' || team.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [teams, searchTerm, statusFilter]);

  const taskMatchesTeam = (task, team) => {
    const hasTeamId = task.teamId !== undefined && task.teamId !== null && task.teamId !== '';
    if (hasTeamId && String(task.teamId) === String(team.id)) return true;
    if (!hasTeamId && task.assignedTo) {
      return team.members?.some(
        (member) => String(member.name).trim().toLowerCase() === String(task.assignedTo).trim().toLowerCase()
      );
    }
    return false;
  };

  const selectedTeam = teams.find((t) => String(t.id) === String(selectedTeamId));
  const selectedTeamTasks = selectedTeam ? allTasks.filter((task) => taskMatchesTeam(task, selectedTeam)) : [];

  const handleSelectTeam = (teamId) => {
    setSelectedTeamId((current) => (current === teamId ? null : teamId));
    setError('');
    setCustomRole(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTeamId(null);
    setError('');
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setTaskForm({ title: '', assignee: '', status: 'pending', description: '', dueDate: '', tags: '' });
    setError('');
  };

  const openNewTeam = () => {
    setEditingTeamId(null);
    setTeamForm({ name: '', lead: '', status: 'Active' });
    setError('');
    setModalOpen(true);
  };

  const saveTeam = async () => {
    if (!teamForm.name.trim() || !teamForm.lead.trim()) {
      toast.error('Team name and lead are required.', { id: 'crud' });
      setError('Team name and lead are required.');
      return;
    }

    try {
      if (editingTeamId) {
        const teamObj = teams.find(t => t.id === editingTeamId);
        const payload = { ...teamObj, name: teamForm.name.trim(), lead: teamForm.lead.trim(), status: teamForm.status };
        await axios.put(`http://localhost:5000/teams/${editingTeamId}`, payload, apiHeaders);
        toast.success('Team updated successfully!', { id: 'crud' });
      } else {
        const payload = { ...teamForm, members: [] };
        await axios.post('http://localhost:5000/teams', payload, apiHeaders);
        toast.success('Team created successfully!', { id: 'crud' });
      }
      fetchTeamsAndTasks();
      setModalOpen(false);
      setError('');
    } catch (err) {
      toast.error('Failed to save team.', { id: 'crud' });
    }
  };

  const deleteTeam = async (id) => {
    if (!isAdmin) return;
    try {
      await axios.delete(`http://localhost:5000/teams/${id}`, apiHeaders);
      if (selectedTeamId === id) setSelectedTeamId(null);
      fetchTeamsAndTasks();
      setTeamToDelete(null);
      toast.success('Team deleted successfully!', { id: 'crud' });
    } catch (err) {
      toast.error('Failed to delete team.', { id: 'crud' });
    }
  };

  const addMember = async () => {
    if (!selectedTeam || !isAdmin) return;
    if (!memberForm.name.trim() || !memberForm.role.trim()) {
      toast.error('Member name and role are required.', { id: 'crud' });
      return;
    }
    const newMember = { id: Date.now(), name: memberForm.name.trim(), role: memberForm.role.trim(), assignedTasks: 0, completedTasks: 0 };
    const updatedTeam = { ...selectedTeam, members: [...selectedTeam.members, newMember] };
    
    try {
      await axios.put(`http://localhost:5000/teams/${selectedTeam.id}`, updatedTeam, apiHeaders);
      fetchTeamsAndTasks();
      setMemberForm({ name: '', role: '' });
      setCustomRole(false);
      toast.success('Member added successfully!', { id: 'crud' });
    } catch (err) {
      toast.error('Failed to add member.', { id: 'crud' });
    }
  };

  const deleteMember = async (memberId) => {
    if (!selectedTeam || !isAdmin) return;
    const updatedTeam = { ...selectedTeam, members: selectedTeam.members.filter((m) => m.id !== memberId) };
    try {
      await axios.put(`http://localhost:5000/teams/${selectedTeam.id}`, updatedTeam, apiHeaders);
      fetchTeamsAndTasks();
      toast.success('Member removed successfully!', { id: 'crud' });
    } catch (err) {
      toast.error('Failed to remove member.', { id: 'crud' });
    }
  };

  const addTask = async () => {
    if (!selectedTeam || !isAdmin) return;
    if (!taskForm.title.trim() || !taskForm.assignee.trim()) {
      toast.error('Task title and assignee required.', { id: 'crud' });
      setError('Task title and assignee required.');
      return;
    }

    const payload = {
      name: taskForm.title.trim(),
      description: taskForm.description.trim() || '',
      assignedTo: taskForm.assignee.trim(),
      createdAt: new Date().toISOString(),
      dueDate: taskForm.dueDate || 'TBD',
      deadline: taskForm.dueDate || 'TBD',
      tags: taskForm.tags ? taskForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      status: taskForm.status,
      teamId: selectedTeam.id
    };

    try {
      await axios.post(`http://localhost:5000/tasks`, payload, apiHeaders);
      fetchTeamsAndTasks();
      closeTaskModal();
      toast.success('Task added successfully!', { id: 'crud' });
    } catch(err) {
      toast.error('Failed to add task.', { id: 'crud' });
    }
  };

  const setTaskStatus = async (taskId, newStatus, taskObj) => {
    if (!selectedTeam) return;
    const payload = {
      ...taskObj,
      status: newStatus
    };
    try {
      await axios.put(`http://localhost:5000/tasks/${taskId}`, payload, apiHeaders);
      fetchTeamsAndTasks();
      setOpenTaskDropdown(null);
      toast.success(`Task marked as ${newStatus}!`, { id: 'crud' });
    } catch(err) {
      toast.error('Failed to change status.', { id: 'crud' });
    }
  };

  const deleteTask = async (taskId) => {
    if (!selectedTeam || !isAdmin) return;
    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`, apiHeaders);
      fetchTeamsAndTasks();
      setTaskToDelete(null);
      setOpenTaskDropdown(null);
      toast.success('Task deleted successfully!', { id: 'crud' });
    } catch(err) {
      toast.error('Failed to delete task.', { id: 'crud' });
    }
  };

  const completedInSelected = selectedTeam ? selectedTeamTasks.filter((task) => task.status === 'completed').length : 0;
  const selectionPerf = selectedTeam ? (selectedTeamTasks.length ? Math.round((completedInSelected / selectedTeamTasks.length) * 100) : 0) : 0;

  return (
    <div className="team-container dashboard-page">
      {!selectedTeam ? (
        <>
          <h1 className="team-title">👥 🎯 Teams Dashboard</h1>
          
          <div className="team-overview-cards">
             <article className="overview-card"><h3>Total Teams</h3><p>{totalTeams}</p></article>
             <article className="overview-card"><h3>Total Members</h3><p>{totalMembers}</p></article>
             <article className="overview-card"><h3>Active Teams</h3><p>{activeTeams}</p></article>
             <article className="overview-card"><h3>Tasks / Team</h3><p>{averageTasksPerTeam}</p></article>
          </div>

          <div className="team-controls-stack">
            <input className="team-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search team name or lead..." />
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: 'All', value: 'All' },
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' }
              ]}
              placeholder="Status"
              style={{ flex: 1, maxWidth: '200px', minHeight: '46px' }}
              dropdownStyle={{ minHeight: '46px' }}
            />
            {isAdmin && (
              <div className="team-create-action">
                <button className="add-member-btn" onClick={openNewTeam}>+ Create Team</button>
              </div>
            )}
          </div>

          <section className="team-list-section">
            {filteredTeams.length === 0 ? (
              <p className="no-members-message">No matching teams found.</p>
            ) : (
              <div className="team-cards-grid">
                {filteredTeams.map((team) => (
                  <article key={team.id} className={`team-card ${selectedTeamId === team.id ? 'selected' : ''}`}>
                    <header>
                      <h2>{team.name}</h2>
                      <span className={`status-pill ${team.status.toLowerCase()}`}>{team.status}</span>
                    </header>
                    <p>Lead: <strong>{team.lead}</strong></p>
                    <p>Members: {team.members?.length || 0}</p>
                    <p>Active Tasks: {allTasks.filter((task) => taskMatchesTeam(task, team) && task.status !== 'completed').length}</p>
                    <div className="team-card-actions">
                      <button type="button" className="btn-view" onClick={() => handleSelectTeam(team.id)}>View Team</button>
                      {isAdmin && <button className="btn-delete" onClick={() => setTeamToDelete(team.id)}>Delete</button>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="ds-view">
          <header className="ds-header">
            <button className="ds-back-btn" onClick={() => setSelectedTeamId(null)}>← Back to Teams</button>
            <h2 className="ds-title">{selectedTeam.name} Details</h2>
          </header>

          <div className="ds-grid">
            <div className="ds-col ds-members-col">
              <h3>Members ({selectedTeam.members?.length || 0})</h3>
              
              <div className="ds-list ds-member-list">
                {selectedTeam.members?.map((member) => (
                  <div key={member.id} className="ds-card ds-member-item">
                    <div className="ds-m-info">
                      <span className="ds-m-name">{member.name} ({member.role})</span>
                    </div>
                    <div className="ds-m-stats">
                      <span>Assigned {selectedTeamTasks.filter((t) => String(t.assignedTo).trim().toLowerCase() === String(member.name).trim().toLowerCase()).length} Completed {selectedTeamTasks.filter((t) => String(t.assignedTo).trim().toLowerCase() === String(member.name).trim().toLowerCase() && t.status === 'completed').length}</span>
                    </div>
                    {isAdmin && (
                      <button className="ds-m-remove" onClick={() => deleteMember(member.id)}>Remove</button>
                    )}
                  </div>
                ))}
              </div>

              {isAdmin && (
                <div className="ds-add-row ds-add-member">
                  <input type="text" className="ds-input" placeholder="Member name" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
                  {customRole ? (
                     <div style={{display: 'flex', gap: '4px', flex: 1}}>
                       <input type="text" className="ds-input" placeholder="Custom Role" value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} style={{flex: 1}}/>
                       <button className="ds-btn-secondary" onClick={() => {setCustomRole(false); setMemberForm({...memberForm, role: ''});}} style={{padding: '0 8px'}}>✕</button>
                     </div>
                  ) : (
                    <CustomDropdown
                      value={memberForm.role}
                      onChange={(val) => {
                        if (val === 'CUSTOM') setCustomRole(true);
                        else setMemberForm({ ...memberForm, role: val });
                      }}
                      options={[
                        { label: 'Role', value: '', disabled: true },
                        { label: 'Frontend', value: 'Frontend' },
                        { label: 'Backend', value: 'Backend' },
                        { label: 'Design', value: 'Design' },
                        { label: 'QA', value: 'QA' },
                        { label: 'Lead', value: 'Lead' },
                        { label: '+ Add Custom', value: 'CUSTOM' }
                      ]}
                      placeholder="Role"
                      style={{ flex: 1 }}
                    />
                  )}
                  <button className="ds-btn-primary ds-btn-member" onClick={addMember}>Add Member</button>
                </div>
              )}
            </div>

              <div className="ds-col ds-tasks-wrap">
                <div className="ds-tasks-col">
                  <h3>Tasks</h3>

                  <div className="ds-task-table-wrapper">
                    <table className="ds-task-table">
                      <thead>
                        <tr>
                          <th>Task Name</th>
                          <th>Description</th>
                          <th>Assigned To</th>
                          <th>Created</th>
                          <th>Due Date</th>
                          <th>Tags</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTeamTasks.map((task) => (
                          <tr key={task.id} className="ds-task-row">
                            <td>{task.name}</td>
                            <td>{task.description || 'No description'}</td>
                            <td>{task.assignedTo || 'Unassigned'}</td>
                            <td>{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Unknown'}</td>
                            <td>{task.dueDate && task.dueDate !== 'TBD' ? new Date(task.dueDate).toISOString().split('T')[0] : task.deadline && task.deadline !== 'TBD' ? new Date(task.deadline).toISOString().split('T')[0] : 'TBD'}</td>
                            <td>{Array.isArray(task.tags) ? task.tags.join(', ') : task.tags || 'None'}</td>
                            <td className="ds-t-status ds-capitalize">{task.status}</td>
                            <td>
                              <div className="ds-task-actions">
                                <button className="ds-task-action-btn" onClick={() => setOpenTaskDropdown(openTaskDropdown === task.id ? null : task.id)}>Status</button>
                                {openTaskDropdown === task.id && (
                                  <div className="ds-task-status-dropdown">
                                    <button onClick={() => setTaskStatus(task.id, 'pending', task)}>Pending</button>
                                    <button onClick={() => setTaskStatus(task.id, 'progress', task)}>In Progress</button>
                                    <button onClick={() => setTaskStatus(task.id, 'completed', task)}>Completed</button>
                                    <button onClick={() => setTaskToDelete(task.id)} style={{ color: '#ef4444', borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '4px', paddingTop: '8px' }}>Delete</button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {selectedTeamTasks.length === 0 && (
                      <p className="no-members-message">No tasks are currently assigned to this team.</p>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="ds-add-task-button-wrapper">
                      <button className="ds-btn-primary ds-add-task-btn" onClick={() => setTaskModalOpen(true)}>+ Add Task</button>
                    </div>
                  )}
                </div>

                <div className="ds-analytics-col">
                  <h3>Analytics</h3>
                  <ul className="ds-analytics-list">
                    <li>Tasks Completed: {completedInSelected} / {selectedTeamTasks.length}</li>
                    <li>Performance: {selectionPerf}%</li>
                  </ul>
                </div>
              </div>

          </div>
        </section>
      )}

      {isModalOpen && (
        <div className="team-modal-overlay ds-blur-overlay" onClick={closeModal}>
          <div className="team-modal-content ds-modal" onClick={(e) => e.stopPropagation()} style={{textAlign: 'center', maxWidth: '400px', margin: 'auto'}}>
            <h3 style={{marginBottom: '20px'}}>{editingTeamId ? 'Edit Team' : 'Create Team'}</h3>
            {error && <p className="team-error-message">{error}</p>}
            <input className="team-form-input" value={teamForm.name} placeholder="Team name" onChange={(e) => setTeamForm((p) => ({ ...p, name: e.target.value }))} style={{ marginBottom: '15px', textAlign: 'left' }} />
            <input className="team-form-input" value={teamForm.lead} placeholder="Team lead" onChange={(e) => setTeamForm((p) => ({ ...p, lead: e.target.value }))} style={{ marginBottom: '15px', textAlign: 'left' }} />
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <CustomDropdown
                value={teamForm.status}
                onChange={(val) => setTeamForm((p) => ({ ...p, status: val }))}
                options={[
                  { label: 'Active', value: 'Active' },
                  { label: 'Inactive', value: 'Inactive' }
                ]}
                placeholder="Status"
              />
            </div>
            <div className="team-modal-buttons" style={{justifyContent: 'center', gap: '15px'}}>
              <button className="team-cancel-btn" type="button" onClick={closeModal}>Cancel</button>
              <button className="ds-btn-primary" type="button" onClick={saveTeam}>Save</button>
            </div>
          </div>
        </div>
      )}

      {teamToDelete && (
        <div className="team-modal-overlay ds-blur-overlay" onClick={() => setTeamToDelete(null)}>
           <div className="team-modal-content ds-modal" onClick={e => e.stopPropagation()} style={{textAlign: 'center', maxWidth: '400px', margin: 'auto'}}>
               <h3 style={{marginBottom: '10px'}}>Delete Team</h3>
               <p style={{marginBottom: '20px', color: '#4b5563'}}>Are you sure you want to permanently delete <strong>{teams.find(t=>t.id===teamToDelete)?.name}</strong>?</p>
               <div className="team-modal-buttons" style={{justifyContent: 'center', gap: '15px'}}>
                  <button className="team-cancel-btn" onClick={() => setTeamToDelete(null)}>Cancel</button>
                  <button className="ds-btn-primary" style={{backgroundColor: '#ef4444'}} onClick={() => deleteTeam(teamToDelete)}>Delete</button>
               </div>
           </div>
        </div>
      )}

      {taskToDelete && (
         <div className="team-modal-overlay ds-blur-overlay" onClick={() => setTaskToDelete(null)}>
           <div className="team-modal-content ds-modal" onClick={e => e.stopPropagation()} style={{textAlign: 'center', maxWidth: '400px', margin: 'auto'}}>
               <h3 style={{marginBottom: '10px'}}>Delete Task</h3>
               <p style={{marginBottom: '20px', color: '#4b5563'}}>Are you sure you want to delete this task?</p>
               <div className="team-modal-buttons" style={{justifyContent: 'center', gap: '15px'}}>
                  <button className="team-cancel-btn" onClick={() => setTaskToDelete(null)}>Cancel</button>
                  <button className="ds-btn-primary" style={{backgroundColor: '#ef4444'}} onClick={() => deleteTask(taskToDelete)}>Delete</button>
               </div>
           </div>
        </div>
      )}

      {isTaskModalOpen && (
        <div className="team-modal-overlay ds-blur-overlay" onClick={closeTaskModal}>
          <div className="team-modal-content ds-modal ds-task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="team-modal-header">
              <h2 className="team-modal-title">Add New Task</h2>
              <button className="team-modal-close" onClick={closeTaskModal}>×</button>
            </div>
            {error && <p className="team-error-message">{error}</p>}
            
            <div className="ds-task-form">
              <div className="ds-form-group">
                <label>Task Name *</label>
                <input 
                  type="text" 
                  className="team-form-input" 
                  placeholder="Enter task title" 
                  value={taskForm.title} 
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} 
                />
              </div>

              <div className="ds-form-group">
                <label>Description</label>
                <textarea 
                  className="team-form-input ds-task-textarea" 
                  placeholder="Enter task description" 
                  value={taskForm.description} 
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>

              <div className="ds-form-group">
                <label>Assigned To *</label>
                <CustomDropdown
                  value={taskForm.assignee}
                  onChange={(val) => setTaskForm({ ...taskForm, assignee: val })}
                  options={[
                    { label: 'Select team member', value: '', disabled: true },
                    ...(selectedTeam?.members?.map((m) => ({ label: m.name, value: m.name })) || [])
                  ]}
                  placeholder="Select team member"
                />
              </div>

              <div className="ds-form-row">
                <div className="ds-form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    className="team-form-input" 
                    value={taskForm.dueDate} 
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} 
                  />
                </div>

                <div className="ds-form-group">
                  <label>Status</label>
                  <CustomDropdown
                    value={taskForm.status}
                    onChange={(val) => setTaskForm({ ...taskForm, status: val })}
                    options={[
                      { label: 'Pending', value: 'pending' },
                      { label: 'In Progress', value: 'progress' },
                      { label: 'Completed', value: 'completed' }
                    ]}
                    placeholder="Status"
                  />
                </div>
              </div>

              <div className="ds-form-group">
                <label>Tags</label>
                <input 
                  type="text" 
                  className="team-form-input" 
                  placeholder="Enter tags (comma separated)" 
                  value={taskForm.tags} 
                  onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })} 
                />
              </div>
            </div>

            <div className="team-modal-buttons">
              <button className="team-cancel-btn" type="button" onClick={closeTaskModal}>Cancel</button>
              <button className="team-submit-btn" type="button" onClick={addTask}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
