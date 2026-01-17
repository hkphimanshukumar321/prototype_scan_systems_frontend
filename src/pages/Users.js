import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Search, UserPlus, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.institute_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const getUserInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Student':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Professor':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Employee':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Visitor':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="users-title">User Management</h1>
          <p className="text-muted-foreground">Manage institute members and visitors</p>
        </div>
        <Button className="bg-primary text-primary-foreground" data-testid="add-user-button">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border/40 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or phone..."
              data-testid="search-input"
              className="pl-10 bg-secondary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="bg-secondary/50" data-testid="role-filter">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Student">Students</SelectItem>
                <SelectItem value="Professor">Professors</SelectItem>
                <SelectItem value="Employee">Employees</SelectItem>
                <SelectItem value="Visitor">Visitors</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p>No users found</p>
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <Card 
              key={user.id} 
              className="bg-card border-border/40 p-6 hover:border-primary/50 transition-all duration-200"
              data-testid={`user-card-${index}`}
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16 border-2 border-border">
                  <AvatarImage src={user.photo_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate" data-testid={`user-name-${index}`}>{user.name}</h3>
                  <Badge className={`${getRoleBadgeColor(user.role)} border mt-2 text-xs`} data-testid={`user-role-${index}`}>
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {user.department && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium" data-testid={`user-dept-${index}`}>{user.department}</span>
                  </div>
                )}
                {user.institute_id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Institute ID:</span>
                    <span className="font-mono text-xs" data-testid={`user-id-${index}`}>{user.institute_id}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-mono text-xs" data-testid={`user-phone-${index}`}>{user.phone}</span>
                  </div>
                )}
                {user.is_blocked && (
                  <Badge className="status-blocked border w-full justify-center mt-2">
                    Blocked
                  </Badge>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <Card className="bg-card border-border/40 p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Users:</span>
          <span className="font-bold text-lg" data-testid="total-users">{users.length}</span>
        </div>
      </Card>
    </div>
  );
};
