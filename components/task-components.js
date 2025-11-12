
const { useState, useEffect, useMemo } = React;

// ==================== TASKS COMPONENT ====================

const Tasks = ({ tasks, updateData }) => {
    const { showModal, editing: editingTask, handleAdd, handleEdit, handleSave, handleDelete, closeModal } = useCRUD(tasks, updateData, 'tasks', t => !t.description?.trim() ? { description: 'Required' } : null);
    const [filteredTasks, filter, setFilter] = useFilter(tasks, (t, f) => t.status === f || t.priority === f);

    const handleToggleStatus = (id) => {
        const updatedTasks = tasks.map(t => 
            t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t
        );
        updateData('tasks', updatedTasks);
    };

    const stats = useMemo(() => {
        return {
            total: tasks.length,
            done: tasks.filter(t => t.status === 'done').length,
            pending: tasks.filter(t => t.status === 'pending').length,
            high: tasks.filter(t => t.priority === 'high' && t.status === 'pending').length
        };
    }, [tasks]);

    return (
        <div>
            <Card title={`Tasks Checklist (${stats.done}/${stats.total} completed)`} action={
                <button className="btn btn-primary" onClick={() => handleAdd({
                    description: '', deadline: '', assignedTo: '', status: 'pending', priority: 'medium'
                })}>Add Task</button>
            }>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                    {[['all', 'All'], ['pending', `Pending (${stats.pending})`], ['done', `Done (${stats.done})`], ['high', `High Priority (${stats.high})`]].map(([f, label]) => (
                        <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-small`} onClick={() => setFilter(f)}>{label}</button>
                    ))}
                </div>
            </Card>

            <Card>
                {filteredTasks.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>Done</th>
                                    <th>Task</th>
                                    <th>Deadline</th>
                                    <th>Assigned To</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map(task => (
                                    <tr key={task.id} style={{ opacity: task.status === 'done' ? 0.6 : 1 }}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={task.status === 'done'}
                                                onChange={() => handleToggleStatus(task.id)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td>
                                            <strong style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                                                {task.description}
                                            </strong>
                                        </td>
                                        <td>{formatDate(task.deadline)}</td>
                                        <td>{task.assignedTo}</td>
                                        <td><Badge status={task.priority} /></td>
                                        <td><Badge status={task.status} /></td>
                                        <td><ActionButtons onEdit={() => handleEdit(task)} onDelete={() => handleDelete(task.id)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <EmptyState icon="✅" message="No tasks found" />}
            </Card>

            {showModal && <TaskModal task={editingTask} onSave={handleSave} onClose={closeModal} />}
        </div>
    );
};

const TaskModal = ({ task, onSave, onClose }) => {
    const [formData, setFormData] = useState(task);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{task.description ? 'Edit Task' : 'Add Task'}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Task Description *</label>
                        <textarea 
                            className="form-textarea"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Deadline</label>
                        <input 
                            type="date"
                            className="form-input"
                            value={formData.deadline}
                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Assigned To</label>
                        <input 
                            type="text"
                            className="form-input"
                            value={formData.assignedTo}
                            onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <select 
                            className="form-select"
                            value={formData.priority}
                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select 
                            className="form-select"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="pending">Pending</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => onSave(formData)}
                        disabled={!formData.description}
                    >
                        Save Task
                    </button>
                </div>
            </div>
        </div>
    );
};