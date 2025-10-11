"use client";

import { useState, useEffect } from "react";
import { 
  MdSupervisorAccount, 
  MdAssignment, 
  MdVerifiedUser, 
  MdBlock,
  MdEdit,
  MdDelete,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdInfo,
  MdWarning,
  MdGroups,
  MdSecurity,
  MdAdminPanelSettings
} from "react-icons/md";

interface User {
  id: string;
  address: string;
  email?: string;
  name?: string;
  roles: string[];
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date;
  lastActive: Date;
  kycStatus: 'verified' | 'pending' | 'rejected' | 'not_started';
  permissions: string[];
  activityScore: number;
  region: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  category: 'Core' | 'Supply Chain' | 'Quality' | 'Privacy' | 'Token' | 'Operations';
  userCount: number;
  isActive: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  isSystemPermission: boolean;
}

export default function EnhancedRoleManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
  
  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Role management state
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    category: "Supply Chain" as Role['category'],
    permissions: [] as string[]
  });
  
  // Permission management state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionCategories, setPermissionCategories] = useState<string[]>([]);

  // Bulk action state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'assign_role' | 'revoke_role' | 'suspend' | 'activate' | null>(null);
  const [bulkRoleId, setBulkRoleId] = useState("");

  // Load users data
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Mock users data
      const mockUsers: User[] = [
        {
          id: "user_001",
          address: "0x1234567890123456789012345678901234567890",
          email: "farmer@example.com",
          name: "Abebe Bekele",
          roles: ["COOPERATIVE_ROLE"],
          status: "active",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          kycStatus: "verified",
          permissions: ["create_batch", "view_batches", "manage_cooperative"],
          activityScore: 95,
          region: "Ethiopia"
        },
        {
          id: "user_002",
          address: "0x2345678901234567890123456789012345678901",
          email: "processor@example.com", 
          name: "Coffee Processing Co.",
          roles: ["PROCESSOR_ROLE", "VERIFIER_ROLE"],
          status: "active",
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          kycStatus: "verified",
          permissions: ["process_batches", "verify_quality", "create_retail_products"],
          activityScore: 88,
          region: "Ethiopia"
        },
        {
          id: "user_003",
          address: "0x3456789012345678901234567890123456789012",
          email: "roaster@example.com",
          name: "Premium Roasters Ltd",
          roles: ["ROASTER_ROLE"],
          status: "pending",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000),
          kycStatus: "pending",
          permissions: ["roast_beans", "create_roasted_products"],
          activityScore: 72,
          region: "Kenya"
        }
      ];
      
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Load roles data
  const loadRoles = async () => {
    try {
      const mockRoles: Role[] = [
        {
          id: "ADMIN_ROLE",
          name: "Administrator",
          description: "Full system administration privileges",
          permissions: ["*"],
          category: "Core",
          userCount: 3,
          isActive: true
        },
        {
          id: "COOPERATIVE_ROLE",
          name: "Cooperative",
          description: "Create and manage green bean batches",
          permissions: ["create_batch", "view_batches", "manage_cooperative", "upload_certificates"],
          category: "Supply Chain",
          userCount: 12,
          isActive: true
        },
        {
          id: "PROCESSOR_ROLE",
          name: "Processor",
          description: "Process green beans into retail products",
          permissions: ["process_batches", "create_retail_products", "manage_inventory"],
          category: "Supply Chain",
          userCount: 8,
          isActive: true
        },
        {
          id: "ROASTER_ROLE",
          name: "Roaster",
          description: "Roast green beans and create roasted bean batches",
          permissions: ["roast_beans", "create_roasted_products", "manage_roasting_profiles"],
          category: "Supply Chain",
          userCount: 15,
          isActive: true
        },
        {
          id: "VERIFIER_ROLE",
          name: "Quality Verifier",
          description: "Verify batch quality and authenticity",
          permissions: ["verify_quality", "audit_batches", "create_certificates"],
          category: "Quality",
          userCount: 5,
          isActive: true
        },
        {
          id: "ZK_VERIFIER_ROLE",
          name: "ZK Proof Verifier",
          description: "Verify zero-knowledge proofs for privacy features",
          permissions: ["verify_zk_proofs", "manage_privacy_settings"],
          category: "Privacy",
          userCount: 2,
          isActive: true
        }
      ];
      
      setRoles(mockRoles);
      
    } catch (err) {
      console.error('Error loading roles:', err);
      setError('Failed to load roles');
    }
  };

  // Load permissions data
  const loadPermissions = async () => {
    try {
      const mockPermissions: Permission[] = [
        {
          id: "create_batch",
          name: "Create Batch",
          description: "Create new coffee batches",
          category: "Batch Management",
          isSystemPermission: false
        },
        {
          id: "verify_quality",
          name: "Verify Quality",
          description: "Verify batch quality and issue certificates",
          category: "Quality Control",
          isSystemPermission: false
        },
        {
          id: "manage_treasury",
          name: "Manage Treasury",
          description: "Access and manage treasury operations",
          category: "Financial",
          isSystemPermission: true
        },
        {
          id: "admin_panel",
          name: "Admin Panel Access",
          description: "Access administrative dashboard",
          category: "Administration",
          isSystemPermission: true
        }
      ];
      
      setPermissions(mockPermissions);
      setPermissionCategories(Array.from(new Set(mockPermissions.map(p => p.category))));
      
    } catch (err) {
      console.error('Error loading permissions:', err);
      setError('Failed to load permissions');
    }
  };

  // Filter users based on search and filter criteria
  useEffect(() => {
    let filtered = users;
    
    if (userSearchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.address.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }
    
    if (userFilter !== 'all') {
      filtered = filtered.filter(user => user.status === userFilter);
    }
    
    setFilteredUsers(filtered);
  }, [users, userSearchTerm, userFilter]);

  // Grant role to user
  const grantRoleToUser = async (userId: string, roleId: string) => {
    try {
      setLoading(true);
      
      // Mock role assignment
      console.log(`Granting role ${roleId} to user ${userId}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, roles: [...user.roles, roleId] }
          : user
      ));
      
      setSuccess('Role granted successfully');
      
    } catch (err) {
      console.error('Error granting role:', err);
      setError('Failed to grant role');
    } finally {
      setLoading(false);
    }
  };

  // Revoke role from user
  const revokeRoleFromUser = async (userId: string, roleId: string) => {
    try {
      setLoading(true);
      
      // Mock role revocation
      console.log(`Revoking role ${roleId} from user ${userId}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, roles: user.roles.filter(r => r !== roleId) }
          : user
      ));
      
      setSuccess('Role revoked successfully');
      
    } catch (err) {
      console.error('Error revoking role:', err);
      setError('Failed to revoke role');
    } finally {
      setLoading(false);
    }
  };

  // Execute bulk action
  const executeBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      setError('Please select users and an action');
      return;
    }

    try {
      setLoading(true);
      
      console.log(`Executing ${bulkAction} on users:`, selectedUsers);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(`${bulkAction} executed on ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setBulkAction(null);
      setBulkRoleId("");
      
    } catch (err) {
      console.error('Error executing bulk action:', err);
      setError('Failed to execute bulk action');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
    loadPermissions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'not_started': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdSupervisorAccount size={24} />
            Enhanced Role Management
          </h2>
          <p className="text-gray-600 mt-1">
            Comprehensive user, role, and permission management system
          </p>
        </div>
        
        <button
          onClick={() => {
            loadUsers();
            loadRoles();
            loadPermissions();
          }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <MdRefresh size={16} className={loading ? 'animate-spin' : ''} />
          Refresh All
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-2">
          <MdWarning className="text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-2">
          <MdInfo className="text-green-500" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', label: 'Users', icon: <MdGroups size={20} /> },
            { id: 'roles', label: 'Roles', icon: <MdSecurity size={20} /> },
            { id: 'permissions', label: 'Permissions', icon: <MdAdminPanelSettings size={20} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Filters and Search */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Search users by name, email, or address..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <MdFilterList size={16} />
                  More Filters
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">
                  {selectedUsers.length} user(s) selected
                </span>
                
                <div className="flex items-center gap-4">
                  <select
                    value={bulkAction || ''}
                    onChange={(e) => setBulkAction(e.target.value as any)}
                    className="px-3 py-1 text-sm border border-blue-300 rounded bg-white"
                  >
                    <option value="">Select Action</option>
                    <option value="assign_role">Assign Role</option>
                    <option value="revoke_role">Revoke Role</option>
                    <option value="suspend">Suspend Users</option>
                    <option value="activate">Activate Users</option>
                  </select>
                  
                  {(bulkAction === 'assign_role' || bulkAction === 'revoke_role') && (
                    <select
                      value={bulkRoleId}
                      onChange={(e) => setBulkRoleId(e.target.value)}
                      className="px-3 py-1 text-sm border border-blue-300 rounded bg-white"
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  )}
                  
                  <button
                    onClick={executeBulkAction}
                    disabled={loading || !bulkAction || (bulkAction.includes('role') && !bulkRoleId)}
                    className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Execute
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Users ({filteredUsers.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KYC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(prev => [...prev, user.id]);
                            } else {
                              setSelectedUsers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name || 'Unnamed User'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400 font-mono">
                            {user.address.substring(0, 10)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(roleId => {
                            const role = roles.find(r => r.id === roleId);
                            return (
                              <span key={roleId} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {role?.name || roleId}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getKYCStatusColor(user.kycStatus)}`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.activityScore}%</div>
                        <div className="text-xs text-gray-500">
                          Last: {user.lastActive.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <MdEdit size={16} />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <MdBlock size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">System Roles</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <MdAdd size={16} />
              Create Role
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{role.name}</h4>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {role.category}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Users:</span>
                    <span className="font-medium">{role.userCount}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Permissions:</span>
                    <span className="font-medium">{role.permissions.length}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setSelectedRole(role)}
                      className="flex-1 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button className="flex-1 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">System Permissions</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <MdAdd size={16} />
              Create Permission
            </button>
          </div>

          {permissionCategories.map((category) => (
            <div key={category} className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">{category}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions
                  .filter(permission => permission.category === category)
                  .map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{permission.name}</div>
                        <div className="text-sm text-gray-600">{permission.description}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {permission.isSystemPermission && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                            System
                          </span>
                        )}
                        <button className="text-blue-600 hover:text-blue-800">
                          <MdEdit size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}