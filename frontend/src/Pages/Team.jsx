import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './Team.css';

export default function Team() {
  const [role] = useState(() => localStorage.getItem('userRole') || 'user');
  const isAdmin = role === 'admin';
  const apiHeaders = { headers: { 'X-User-Role': role } };

  const [teams, setTeams] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [teamForm, setTeamForm] = useState({ name: '', lead: '', status: 'Active' });
  
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
      setTaskForm({ title: '', assignee: '', status: 'pending', description: '', dueDate: '', tags: '' });
      setError('');
      toast.success('Task added successfully!', { id: 'crud' });
    } catch(err) {
      toast.error('Failed to add task.', { id: 'crud' });
    }
  };

  const setTaskStatus = async (taskId, newStatus, taskObj) => {
    if (!selectedTeam || !isAdmin) return;
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
            <select className="team-form-select team-full-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
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
                    <select className="ds-select" value={memberForm.role} onChange={(e) => {
                      if (e.target.value === 'CUSTOM') setCustomRole(true);
                      else setMemberForm({ ...memberForm, role: e.target.value });
                    }}>
                      <option value="" disabled>Role</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Design">Design</option>
                      <option value="QA">QA</option>
                      <option value="Lead">Lead</option>
                      <option value="CUSTOM">+ Add Custom</option>
                    </select>
                  )}
                  <button className="ds-btn-primary ds-btn-member" onClick={addMember}>Add Member</button>
                </div>
              )}
            </div>

            {isAdmin ? (
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
                            <td>{task.dueDate || task.deadline || 'TBD'}</td>
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
                                    <button onClick={() => setTaskToDelete(task.id)} style={{ color: '#ef4444', borderTop: '1px solid #f3f4f6', marginTop: '4px', paddingTop: '8px' }}>Delete</button>
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

                  <div className="ds-add-row ds-add-task">
                    <input type="text" className="ds-input ds-input-wide" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
                    <input type="text" className="ds-input ds-input-wide" placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
                    <select className="ds-select" value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}>
                      <option value="" disabled>Assign to</option>
                      {selectedTeam.members?.map((m) => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                    <input type="date" className="ds-input" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                    <input type="text" className="ds-input" placeholder="Tags (comma separated)" value={taskForm.tags} onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })} />
                    <select className="ds-select" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                      <option value="pending">Pending</option>
                      <option value="progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button className="ds-btn-primary" onClick={addTask}>Add Task</button>
                  </div>
                </div>

                <div className="ds-analytics-col">
                  <h3>Analytics</h3>
                  <ul className="ds-analytics-list">
                    <li>Tasks Completed: {completedInSelected} / {selectedTeamTasks.length}</li>
                    <li>Performance: {selectionPerf}%</li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {isModalOpen && (
        <div className="team-modal-overlay ds-blur-overlay" onClick={closeModal}>
          <div className="team-modal-content ds-modal" onClick={(e) => e.stopPropagation()}>
            <div className="team-modal-header">
              <h2 className="team-modal-title">{editingTeamId ? 'Edit Team' : 'Create Team'}</h2>
              <button className="team-modal-close" onClick={closeModal}>×</button>
            </div>
            {error && <p className="team-error-message">{error}</p>}
            <input className="team-form-input" value={teamForm.name} placeholder="Team name" onChange={(e) => setTeamForm((p) => ({ ...p, name: e.target.value }))} style={{ marginBottom: '10px' }} />
            <input className="team-form-input" value={teamForm.lead} placeholder="Team lead" onChange={(e) => setTeamForm((p) => ({ ...p, lead: e.target.value }))} style={{ marginBottom: '10px' }} />
            <select className="team-form-select" value={teamForm.status} onChange={(e) => setTeamForm((p) => ({ ...p, status: e.target.value }))} style={{ marginBottom: '20px' }}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <div className="team-modal-buttons">
              <button className="team-cancel-btn" type="button" onClick={closeModal}>Cancel</button>
              <button className="team-submit-btn" type="button" onClick={saveTeam}>Save</button>
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
    </div>
  );
}
