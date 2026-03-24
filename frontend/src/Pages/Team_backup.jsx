import React, { useMemo, useState } from 'react';
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
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [teamForm, setTeamForm] = useState({ name: '', lead: '', status: 'Active' });
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '', status: 'Pending' });
  const [error, setError] = useState('');

  const totalTeams = teams.length;
  const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);
  const activeTeams = teams.filter((team) => team.status === 'Active').length;
  const totalTasks = teams.reduce((sum, team) => sum + team.tasks.length, 0);
  const averageTasksPerTeam = totalTeams ? Math.round(totalTasks / totalTeams) : 0;

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const lowerSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !lowerSearch ||
        team.name.toLowerCase().includes(lowerSearch) ||
        team.lead.toLowerCase().includes(lowerSearch);

      const matchesStatus =
        statusFilter === 'All' || team.status === statusFilter;

      const size = team.members.length;
      const matchesSize =
        sizeFilter === 'All' ||
        (sizeFilter === 'Small' && size <= 3) ||
        (sizeFilter === 'Medium' && size >= 4 && size <= 7) ||
        (sizeFilter === 'Large' && size >= 8);

      return matchesSearch && matchesStatus && matchesSize;
    });
  }, [teams, searchTerm, statusFilter, sizeFilter]);

  const selectedTeam = teams.find((team) => team.id === selectedTeamId);

  const handleSelectTeam = (teamId) => {
    setSelectedTeamId(teamId);
    setError('');
  };

  const handleDeleteTeam = (teamId) => {
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    setTeams((prev) => prev.filter((team) => team.id !== teamId));
    if (selectedTeamId === teamId) setSelectedTeamId(null);
  };

  const openCreateTeamModal = () => {
    setError('');
    setEditingTeamId(null);
    setTeamForm({ name: '', lead: '', status: 'Active' });
    setIsTeamModalOpen(true);
  };

  const openEditTeamModal = (team) => {
    if (!isAdmin) return;
    setError('');
    setEditingTeamId(team.id);
    setTeamForm({ name: team.name, lead: team.lead, status: team.status });
    setIsTeamModalOpen(true);
  };

  const closeModal = () => {
    setIsTeamModalOpen(false);
    setError('');
  };

  const saveTeam = () => {
    if (!teamForm.name.trim() || !teamForm.lead.trim()) {
      setError('Team name and team lead are required.');
      return;
    }

    if (editingTeamId) {
      setTeams((prev) =>
        prev.map((team) =>
          team.id === editingTeamId
            ? {
                ...team,
                name: teamForm.name.trim(),
                lead: teamForm.lead.trim(),
                status: teamForm.status
              }
            : team
        )
      );
    } else {
      const newTeam = {
        id: Math.max(0, ...teams.map((t) => t.id)) + 1,
        name: teamForm.name.trim(),
        lead: teamForm.lead.trim(),
        status: teamForm.status,
        members: [],
        tasks: []
      };
      setTeams((prev) => [...prev, newTeam]);
    }

    setIsTeamModalOpen(false);
    setError('');
  };

  const addMemberToSelectedTeam = (memberName, memberRole) => {
    if (!selectedTeam || !isAdmin || !memberName.trim() || !memberRole.trim()) return;

    const member = {
      id: Date.now(),
      name: memberName.trim(),
      role: memberRole.trim(),
      assignedTasks: 0,
      completedTasks: 0
    };

    setTeams((prev) =>
      prev.map((team) =>
        team.id === selectedTeam.id
          ? { ...team, members: [...team.members, member] }
          : team
      )
    );
  };

  const removeMember = (memberId) => {
    if (!selectedTeam || !isAdmin) return;

    setTeams((prev) =>
      prev.map((team) =>
        team.id === selectedTeam.id
          ? { ...team, members: team.members.filter((m) => m.id !== memberId) }
          : team
      )
    );
  };

  const addTaskToSelectedTeam = () => {
    if (!selectedTeam || !isAdmin) return;
    if (!taskForm.title.trim() || !taskForm.assignee.trim()) {
      setError('Task title and assignee are required.');
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
  };

  const toggleTaskStatus = (taskId) => {
    if (!selectedTeam || !isAdmin) return;

    setTeams((prev) =>
      prev.map((team) =>
        team.id === selectedTeam.id
          ? {
              ...team,
              tasks: team.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, status: task.status === 'Pending' ? 'Completed' : 'Pending' }
                  : task
              )
            }
          : team
      )
    );
  };

  const selectedTeamCompletedTasks = selectedTeam
    ? selectedTeam.tasks.filter((task) => task.status === 'Completed').length
    : 0;

  const selectedTeamPerformance = selectedTeam
    ? selectedTeam.tasks.length
      ? Math.round((selectedTeamCompletedTasks / selectedTeam.tasks.length) * 100)
      : 0
    : 0;

  const mostActiveMember = selectedTeam
    ? selectedTeam.members.reduce((best, member) => {
        if (!best) return member;
        const memberActivity = member.completedTasks + member.assignedTasks;
        const bestActivity = best.completedTasks + best.assignedTasks;
        return memberActivity > bestActivity ? member : best;
      }, null)
    : null;

  return (
    <div className= team-container>
      <h1 className=team-title>👥 🎯 Teams Dashboard</h1>

      <div className=team-overview-cards>
        <article className=overview-card>
          <h3>Total Teams</h3>
          <p>{totalTeams}</p>
        </article>
        <article className=overview-card>
          <h3>Total Members</h3>
          <p>{totalMembers}</p>
        </article>
        <article className=overview-card>
          <h3>Active Teams</h3>
          <p>{activeTeams}</p>
        </article>
        <article className=overview-card>
          <h3>Avg Tasks / Team</h3>
          <p>{averageTasksPerTeam}</p>
        </article>
      </div>

      <div className=team-controls-bar>
        <input
          className=team-search-input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder=🔍 Search team name or lead...
        />

        <div className=team-filters>
          <label>
            Status:
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className=team-form-select
            >
              <option value=All>All</option>
              <option value=Active>Active</option>
              <option value=Inactive>Inactive</option>
            </select>
          </label>

          <label>
            Team Size:
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className=team-form-select
            >
              <option value=All>All</option>
              <option value=Small>Small (≤3)</option>
              <option value=Medium>Medium (4-7)</option>
              <option value=Large>Large (8+)</option>
            </select>
          </label>
        </div>

        {isAdmin ; (
          <button className=add-member-btn onClick={openCreateTeamModal}>
            ➕ Create Team
          </button>
        )}
      </div>

      <section className=team-list-section>
        {filteredTeams.length === 0 ? (
          <p className=no-members-message>No teams match the filter / search criteria.</p>
        ) : (
          <div className=team-cards-grid>
            {filteredTeams.map((team) => (
              <article
                key={team.id}
                className={	eam-card }
              >
                <header>
                  <h2>{team.name}</h2>
                  <span className={status-pill }>
                    {team.status}
                  </span>
                </header>
                <p>Lead: <strong>{team.lead}</strong></p>
                <p>Members: {team.members.length}</p>
                <p>Active Tasks: {team.tasks.filter((t) => t.status === 'Pending').length}</p>

                <div className=team-card-actions>
                  <button type=button onClick={() => handleSelectTeam(team.id)}>
                    View Team
                  </button>

                  {isAdmin ; (
                    <>
                      <button type=button onClick={() => openEditTeamModal(team)}>
                        Edit
                      </button>
                      <button
                        type=button
                        className=team-delete-btn
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedTeam ; (
        <section className=team-details>
          <h2>🏢 {selectedTeam.name} — {selectedTeam.status}</h2>

          <div className=team-detail-grid>
            <article className=team-detail-card>
              <h3>Team Members</h3>
              {selectedTeam.members.length === 0 ? (
                <p className=no-members-message>No members in this team.</p>
              ) : (
                <ul className=team-member-list>
                  {selectedTeam.members.map((member) => (
                    <li key={member.id}>
                      <span>{member.name} ({member.role})</span>
                      <div className=member-stats>
                        <span>Assigned: {member.assignedTasks}</span>
                        <span>Completed: {member.completedTasks}</span>
                      </div>
                      {isAdmin ; (
                        <button
                          className=team-delete-btn
                          onClick={() => removeMember(member.id)}
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {isAdmin && (
                <div className=team-add-member-row>
                  <input
                    type=text
                    placeholder=New member name
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, assignee: e.target.value }))}
                    className=team-form-input
                  />
                  <input
                    type=text
                    placeholder=Role
                    value={taskForm.title}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                    className=team-form-input
                  />
                  <button
                    type=button
                    onClick={() => {
                      addMemberToSelectedTeam(taskForm.assignee, taskForm.title);
                      setTaskForm((prev) => ({ ...prev, assignee: '', title: '' }));
                    }}
                    className=add-member-btn
                  >
                    + Add Member
                  </button>
                </div>
              )}
            </article>

            <article className=team-detail-card>
              <h3>Team Task Management</h3>
              {selectedTeam.tasks.length === 0 ? (
                <p className=no-members-message>No tasks yet.</p>
              ) : (
                <ul className=task-list>
                  {selectedTeam.tasks.map((task) => (
                    <li key={task.id} className=task-item>
                      <div>
                        <strong>{task.title}</strong>
                        <p>Assigned to: {task.assignee}</p>
                        <p>Status: {task.status}</p>
                      </div>
                      {isAdmin && (
                        <button
                          type=button
                          onClick={() => toggleTaskStatus(task.id)}
                          className=team-edit-btn
                        >
                          Mark {task.status === 'Pending' ? 'Completed' : 'Pending'}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {isAdmin ; (
                <div className=task-form-row>
                  <input
                    className=team-form-input
                    placeholder=Task title
                    value={taskForm.title}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                  <input
                    className=team-form-input
                    placeholder=Assign to member
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, assignee: e.target.value }))}
                  />
                  <select
                    className=team-form-select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value=Pending>Pending</option>
                    <option value=Completed>Completed</option>
                  </select>
                  <button type=button onClick={addTaskToSelectedTeam} className=add-member-btn>
                    + Add Task
                  </button>
                </div>
              )}
            </article>

            <article className=team-detail-card>
              <h3>Team Analytics</h3>
              <p>Tasks Completed: {selectedTeamCompletedTasks} / {selectedTeam.tasks.length}</p>
              <p>Performance: {selectedTeamPerformance}%</p>
              <p>Most Active Member: {mostActiveMember ? mostActiveMember.name : 'N/A'}</p>
            </article>
          </div>
        </section>
      )}

      {isTeamModalOpen ; (
        <div className=team-modal-overlay onClick={closeModal}>
          <div className=team-modal-content onClick={(e) => e.stopPropagation()}>
            <h2 className=team-modal-title>
              {editingTeamId ? 'Edit Team' : 'Create Team'}
            </h2>

            {error ; <p className=team-error-message>{error}</p>}

            <div className=team-form-group>
              <label className=team-form-label>Team Name</label>
              <input
                className=team-form-input
                value={teamForm.name}
                onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className=team-form-group>
              <label className=team-form-label>Team Lead</label>
              <input
                className=team-form-input
                value={teamForm.lead}
                onChange={(e) => setTeamForm((prev) => ({ ...prev, lead: e.target.value }))}
              />
            </div>

            <div className=team-form-group>
              <label className=team-form-label>Status</label>
              <select
                className=team-form-select
                value={teamForm.status}
                onChange={(e) => setTeamForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value=Active>Active</option>
                <option value=Inactive>Inactive</option>
              </select>
            </div>

            <div className=team-modal-buttons>
              <button type=button className=team-cancel-btn onClick={closeModal}>
                Cancel
              </button>
              <button type=button className=team-submit-btn onClick={saveTeam}>
                {editingTeamId ? 'Update Team' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
