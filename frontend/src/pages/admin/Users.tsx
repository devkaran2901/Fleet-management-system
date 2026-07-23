import React, { useCallback, useEffect, useState } from 'react';
import { UserCheck, UserMinus, UserPlus, Users as UsersIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi, errorConflicts, errorMessage } from '../../services/adminApi';
import type { AdminRole, AdminUser } from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, Input, LoadingState, Modal, Panel, Select, Toggle, useToast,
} from '../../components/admin/ui';
import { Stat } from './orgShared';

export const Users: React.FC = () => {
  const { notify } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [draftRoles, setDraftRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');

  const [adding, setAdding] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('DRIVER');

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      notify('error', 'All fields are required');
      return;
    }
    setSaving(true);
    try {
      await adminApi.createUser({
        firstName,
        lastName,
        email,
        password,
        roles: [selectedRole],
      });
      notify('success', `Created user ${email}`);
      setAdding(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setSelectedRole('DRIVER');
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not create user'));
    } finally {
      setSaving(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [userData, roleData] = await Promise.all([adminApi.users(), adminApi.roles()]);
      setUsers(userData);
      setRoles(roleData);
    } catch (err) {
      setError(errorMessage(err, 'Could not load the users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(query.toLowerCase()),
  );

  const saveRoles = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await adminApi.setUserRoles(editing.id, draftRoles);
      notify('success', `Updated roles for ${editing.email}`);
      setEditing(null);
      await load();
    } catch (err) {
      const conflicts = errorConflicts(err);
      notify(
        'error',
        conflicts.length > 0
          ? `Blocked — ${conflicts[0].message}`
          : errorMessage(err, 'Could not update the roles'),
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user: AdminUser) => {
    try {
      await adminApi.setUserActive(user.id, !user.isActive);
      notify('success', `${user.email} is now ${user.isActive ? 'inactive' : 'active'}`);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not change the user status'));
    }
  };

  if (loading) return <LoadingState label="Loading users" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const activeCount = users.filter((u) => u.isActive).length;
  const unassigned = users.filter((u) => u.roles.length === 0).length;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Identity, RBAC &amp; Org</span>
          <h1 className="adm-page-title">
            <UsersIcon size={22} color="var(--green)" /> Users
          </h1>
          <p className="adm-page-sub">
            A user may stack several roles. The combined capability set is validated against
            segregation of duties on save — see{' '}
            <Link to="/admin/permissions" style={{ color: 'var(--green)' }}>Permissions</Link>{' '}
            to inspect what someone can actually do.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<UserPlus size={14} />}
          onClick={() => setAdding(true)}
        >
          Add user
        </Button>
      </div>

      <div className="adm-stats">
        <Stat icon={<UsersIcon size={15} color="var(--green)" />} value={users.length} label="Total users" />
        <Stat icon={<UserCheck size={15} color="var(--green)" />} value={activeCount} label="Active" />
        <Stat icon={<UserMinus size={15} color="var(--text-3)" />} value={users.length - activeCount} label="Disabled" />
        <Stat icon={<UserMinus size={15} color="var(--amber)" />} value={unassigned} label="Without a role" />
      </div>

      <Panel
        title="All users"
        subtitle={`${filtered.length} shown`}
        actions={
          <Input
            style={{ width: 220 }}
            placeholder="Search name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        }
        padded={false}
      >
        {filtered.length === 0 ? (
          <EmptyState title="No users match" hint="Try a different search term." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="adm-avatar">
                          {`${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="adm-row-sub">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {user.roles.length === 0 ? (
                          <span className="adm-row-sub">No roles</span>
                        ) : (
                          user.roles.map((r) => <Badge key={r} tone="green">{r}</Badge>)
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge tone={user.isActive ? 'green' : 'grey'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="adm-cell-mono">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className="adm-cell-actions" style={{ alignItems: 'center' }}>
                        <Toggle
                          checked={user.isActive}
                          onChange={() => void toggleActive(user)}
                          label={`Toggle ${user.email}`}
                        />
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => { setEditing(user); setDraftRoles(user.roles); }}
                        >
                          Roles
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal
        open={editing !== null}
        title="Assign roles"
        subtitle={editing?.email}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={saveRoles}>Save roles</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {roles.map((role) => {
            const on = draftRoles.includes(role.name);
            return (
              <div key={role.id} className={`adm-cap-row ${on ? 'is-on' : ''}`}>
                <input
                  type="checkbox"
                  className="adm-checkbox"
                  checked={on}
                  onChange={() =>
                    setDraftRoles((r) => (on ? r.filter((n) => n !== role.name) : [...r, role.name]))
                  }
                  aria-label={role.name}
                />
                <div className="adm-cap-label">
                  {role.name}
                  <span className="adm-cap-key">
                    {role.capabilities.length} capabilities
                    {role.description ? ` · ${role.description}` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={adding}
        title="Add new user"
        subtitle="Create a new user profile and assign initial roles"
        onClose={() => setAdding(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={createUser}>Create user</Button>
          </>
        }
      >
        <form onSubmit={createUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="adm-form-row">
            <div className="adm-field">
              <span className="adm-field-label">First Name</span>
              <Input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
            </div>
            <div className="adm-field">
              <span className="adm-field-label">Last Name</span>
              <Input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="adm-field">
            <span className="adm-field-label">Email Address</span>
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@fleetos.com"
            />
          </div>

          <div className="adm-field">
            <span className="adm-field-label">Password</span>
            <Input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="adm-field">
            <span className="adm-field-label">Initial Role</span>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name} {role.description ? ` - ${role.description}` : ''}
                </option>
              ))}
            </Select>
          </div>
        </form>
      </Modal>
    </>
  );
};
