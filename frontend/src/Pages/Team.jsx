import React, { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import './Team.css';

export default function Team() {
  const role = 'admin';
  const isAdmin = role === 'admin';

  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'Frontend Team',
      lead: 'John Doe',
      status: 'Active',
      members: [
        { id: 101, name: 'John Doe', role: 'Lead', assignedTasks: 8, completedTasks: 7 },
        { id: 102, name: 'Emily Brown', role: 'UI/UX Designer', assignedTasks: 6, completedTasks: 5 },
        { id: 103, name: 'Alex Smith', role: 'Frontend Dev', assignedTasks: 7, completedTasks: 5 }
      ],
      tasks: [
        { id: 201, title: 'Design landing page', assignee: 'Emily Brown', status: 'Completed' },
        { id: 202, title: 'Implement auth UI', assignee: 'Alex Smith', status: 'Pending' }
      ]
    },
    {
      id: 2,
      name: 'Backend Team',
      lead: 'Sarah Miller',
      status: 'Active',
      members: [
        { id: 111, name: 'Sarah Miller', role: 'Lead', assignedTasks: 6, completedTasks: 6 },
        { id: 112, name: 'Mike Johnson', role: 'Senior Backend', assignedTasks: 8, completedTasks: 7 }
      ],
      tasks: [
        { id: 212, title: 'Build API gateway', assignee: 'Mike Johnson', status: 'Pending' },
        { id: 213, title: 'Database migration', assignee: 'Sarah Miller', status: 'Completed' }
      ]
    },
    {
      id: 3,
      name: 'QA Team',
      lead: 'Karen Lee',
      status: 'Inactive',
      members: [
        { id: 121, name: 'Karen Lee', role: 'Lead', assignedTasks: 3, completedTasks: 3 },
        { id: 122, name: 'Tom Richards', role: 'QA Engineer', assignedTasks: 6, completedTasks: 6 }
      ],
      tasks: [
        { id: 222, title: 'Write E2E tests', assignee: 'Tom Richards', status: 'Completed' }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [teamForm, setTeamForm] = useState({ name: '', lead: '', status: 'Active' });
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '', status: 'Pending' });
  const [memberForm, setMemberForm] = useState({ name: '', role: '' });
  const [error, setError] = useState('');

  const totalTeams = teams.length;
  const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);
  const activeTeams = teams.filter((team) => team.status === 'Active').length;
  const totalTasks = teams.reduce((sum, team) => sum + team.tasks.length, 0);
  const averageTasksPerTeam = totalTeams ? Math.round(totalTasks / totalTeams) : 0;

  const filteredTeams = useMemo(() => {
    const key = searchTerm.trim().toLowerCase();
    return teams.filter((team) => {
      const searchMatch =
        !key ||
        team.name.toLowerCase().includes(key) ||
        team.lead.toLowerCase().includes(key);
      const statusMatch = statusFilter === 'All' || team.status === statusFilter;
      const size = team.members.length;
      const sizeMatch =
        sizeFilter === 'All' ||
        (sizeFilter === 'Small' && size <= 3) ||
        (sizeFilter === 'Medium' && size >= 4 && size <= 7) ||
        (sizeFilter === 'Large' && size >= 8);
      return searchMatch && statusMatch && sizeMatch;
    });
  }, [teams, searchTerm, statusFilter, sizeFilter]);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const handleSelectTeam = (teamId) => {
    setSelectedTeamId((current) => (current === teamId ? null : teamId));
    setError('');
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

  const saveTeam = () => {
    if (!teamForm.name.trim() || !teamForm.lead.trim()) {
      toast.error('Team name and lead are required.');
      setError('Team name and lead are required.');
      return;
    }

    if (editingTeamId) {
      setTeams((prev) =>
        prev.map((team) =>
          team.id === editingTeamId
            ? { ...team, name: teamForm.name.trim(), lead: teamForm.lead.trim(), status: teamForm.status }
            : team
        )
      );
      toast.success('Team updated successfully!');
    } else {
      const next = {
        id: Math.max(0, ...teams.map((t) => t.id)) + 1,
        ...teamForm,
        members: [],
        tasks: []
      };
      setTeams((prev) => [...prev, next]);
      toast.success('Team created successfully!');
    }

    setModalOpen(false);
    setError('');
  };

  const deleteTeam = (id) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete this team?')) return;
    setTeams((prev) => prev.filter((team) => team.id !== id));
    if (selectedTeamId === id) setSelectedTeamId(null);
    toast.success('Team deleted successfully!');
  };

  const addMember = (memberName, memberRole) => {
    if (!selectedTeam || !isAdmin) return;
    if (!memberName.trim() || !memberRole.trim()) {
      toast.error('Member name and role are required.');
      return;
    }
    const newMember = { id: Date.now(), name: memberName.trim(), role: memberRole.trim(), assignedTasks: 0, completedTasks: 0 };
    setTeams((prev) =>
      prev.map((team) =>
        team.id === selectedTeam.id ? { ...team, members: [...team.members, newMember] } : team
      )
    );
    toast.success('Member added successfully!');
  };

  const deleteMember = (memberId) => {
    if (!selectedTeam || !isAdmin) return;
    setTeams((prev) =>
      prev.map((team) =>
        team.id === selectedTeam.id ? { ...team, members: team.members.filter((m) => m.id !== memberId) } : team
      )
    );
    toast.success('Member removed successfully!');
  };

  const addTask = () => {
    if (!selectedTeam || !isAdmin) return;
    if (!taskForm.title.trim() || !taskForm.assignee.trim()) {
      toast.error('Task title and assignee required.');
      setError('Task title and assignee required.');
      return;
    }

    const newTask = {
      id: Date.now(),
      title: taskForm.title.trim(),
      assignee: taskForm.assignee.trim(),
      status: taskForm.status
    };

    setTeams((prev) =>
      prev.map((team) =>
        team.id === selectedTeam.id ? { ...team, tasks: [...team.tasks, newTask] } : team
      )
    );

    setTaskForm({ title: '', assignee: '', status: 'Pending' });
    setError('');
    toast.success('Task added successfully!');
  };

  const toggleTaskStatus = (taskId) => {
    if (!selectedTeam || !isAdmin) return;
    setTeams((prev) =>
      prev.map((team) =>
        team.id === selectedTeam.id
          ? {
              ...team,
              tasks: team.tasks.map((task) => {
                if (task.id === taskId) {
                  const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
                  toast.success(`Task marked as ${newStatus}!`);
                  return { ...task, status: newStatus };
                }
                return task;
              })
            }
          : team
      )
    );
  };

  const completedInSelected = selectedTeam ? selectedTeam.tasks.filter((task) => task.status === 'Completed').length : 0;
  const selectionPerf = selectedTeam ? (selectedTeam.tasks.length ? Math.round((completedInSelected / selectedTeam.tasks.length) * 100) : 0) : 0;
  const mostActive = selectedTeam
    ? selectedTeam.members.reduce((lead, member) => {
        if (!lead) return member;
        const memberScore = member.completedTasks + member.assignedTasks;
        const leadScore = lead.completedTasks + lead.assignedTasks;
        return memberScore > leadScore ? member : lead;
      }, null)
    : null;

  return (
    <div className="team-container dashboard-page">
      <h1 className="team-title">👥 🎯 Teams Dashboard</h1>

      <div className="team-overview-cards">
        <article className="overview-card"><h3>Total Teams</h3><p>{totalTeams}</p></article>
        <article className="overview-card"><h3>Total Members</h3><p>{totalMembers}</p></article>
        <article className="overview-card"><h3>Active Teams</h3><p>{activeTeams}</p></article>
        <article className="overview-card"><h3>Tasks / Team</h3><p>{averageTasksPerTeam}</p></article>
      </div>

      <div className="team-controls-bar">
        <input className="team-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search team name or lead..." />
        <select className="team-form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select className="team-form-select" value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Large">Large</option>
        </select>
        {isAdmin && <button className="add-member-btn" onClick={openNewTeam}>➕ Create Team</button>}
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
                <p>Members: {team.members.length}</p>
                <p>Active Tasks: {team.tasks.filter((t) => t.status === 'Pending').length}</p>
                <div className="team-card-actions">
                  <button type="button" onClick={() => handleSelectTeam(team.id)}>View Team</button>
                  {isAdmin && <button className="team-delete-btn" onClick={() => deleteTeam(team.id)}>Delete</button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedTeam && (
        <section className="team-details">
          <h2>{selectedTeam.name} Details</h2>
          <div className="team-detail-grid">
            <article className="team-detail-card">
              <h3>Members ({selectedTeam.members.length})</h3>
              <ul className="team-member-list">
                {selectedTeam.members.map((member) => (
                  <li key={member.id}>
                    <span>{member.name} ({member.role})</span>
                    <div className="member-stats"><span>Assigned {member.assignedTasks}</span><span>Completed {member.completedTasks}</span></div>
                    {isAdmin && <button className="team-delete-btn" onClick={() => deleteMember(member.id)}>Remove</button>}
                  </li>
                ))}
              </ul>
              {isAdmin && (
                <div className="team-add-member-row">
                  <input type="text" className="team-form-input" placeholder="Member name" value={memberForm.name} onChange={(e) => setMemberForm((p) => ({ ...p, name: e.target.value }))} />
                  <input type="text" className="team-form-input" placeholder="Role" value={memberForm.role} onChange={(e) => setMemberForm((p) => ({ ...p, role: e.target.value }))} />
                  <button type="button" className="add-member-btn" onClick={() => { addMember(memberForm.name, memberForm.role); setMemberForm({ name: '', role: '' }); }}>Add Member</button>
                </div>
              )}
            </article>

            <article className="team-detail-card">
              <h3>Tasks</h3>
              <ul className="task-list">
                {selectedTeam.tasks.map((task) => (
                  <li key={task.id} className="task-item">
                    <div>
                      <strong>{task.title}</strong>
                      <p>{task.assignee}</p>
                      <p>{task.status}</p>
                    </div>
                    {isAdmin && <button className="team-edit-btn" type="button" onClick={() => toggleTaskStatus(task.id)}>{task.status === 'Pending' ? 'Complete' : 'Reopen'}</button>}
                  </li>
                ))}
              </ul>
              {isAdmin && (
                <div className="task-form-row">
                  <input className="team-form-input" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} />
                  <input className="team-form-input" placeholder="Assign to" value={taskForm.assignee} onChange={(e) => setTaskForm((p) => ({ ...p, assignee: e.target.value }))} />
                  <select className="team-form-select" value={taskForm.status} onChange={(e) => setTaskForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button type="button" className="add-member-btn" onClick={addTask}>Add Task</button>
                </div>
              )}
            </article>

            <article className="team-detail-card">
              <h3>Analytics</h3>
              <p>Tasks Completed: {completedInSelected} / {selectedTeam.tasks.length}</p>
              <p>Performance: {selectionPerf}%</p>
              <p>Most Active Member: {mostActive ? mostActive.name : 'N/A'}</p>
            </article>
          </div>
        </section>
      )}

      {isModalOpen && (
        <div className="team-modal-overlay" onClick={closeModal}>
          <div className="team-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="team-modal-title">{editingTeamId ? 'Edit Team' : 'Create Team'}</h2>
            {error && <p className="team-error-message">{error}</p>}
            <input className="team-form-input" value={teamForm.name} placeholder="Team name" onChange={(e) => setTeamForm((p) => ({ ...p, name: e.target.value }))} />
            <input className="team-form-input" value={teamForm.lead} placeholder="Team lead" onChange={(e) => setTeamForm((p) => ({ ...p, lead: e.target.value }))} />
            <select className="team-form-select" value={teamForm.status} onChange={(e) => setTeamForm((p) => ({ ...p, status: e.target.value }))}>
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
    </div>
  );
}
