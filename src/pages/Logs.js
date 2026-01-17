import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, ArrowDownCircle, ArrowUpCircle, AlertTriangle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, statusFilter]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API}/logs?limit=100`);
      setLogs(response.data);
      setFilteredLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.gate_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const getStatusBadge = (status) => {
    if (status === 'IN') {
      return (
        <Badge className="status-allowed border" data-testid={`log-status-${status}`}>
          <ArrowDownCircle className="w-3 h-3 mr-1" />
          Entry
        </Badge>
      );
    } else if (status === 'OUT') {
      return (
        <Badge className="status-pending border" data-testid={`log-status-${status}`}>
          <ArrowUpCircle className="w-3 h-3 mr-1" />
          Exit
        </Badge>
      );
    } else {
      return (
        <Badge className="status-blocked border" data-testid={`log-status-${status}`}>
          <AlertTriangle className="w-3 h-3 mr-1" />
          Blocked
        </Badge>
      );
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
          <h1 className="text-4xl font-bold mb-2" data-testid="logs-title">Activity Logs</h1>
          <p className="text-muted-foreground">Complete history of all gate activities</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border/40 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by gate, user ID, or vehicle number..."
              data-testid="log-search"
              className="pl-10 bg-secondary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-secondary/50" data-testid="status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="IN">Entries</SelectItem>
                <SelectItem value="OUT">Exits</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="bg-card border-border/40">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/40">
              <tr>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Timestamp</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Gate</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">User ID</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Vehicle</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-muted-foreground">
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr 
                    key={log.log_id} 
                    className="border-b border-border/20 hover:bg-secondary/30 transition-colors"
                    data-testid={`log-row-${index}`}
                  >
                    <td className="p-4">
                      <span className="font-mono text-xs" data-testid={`log-timestamp-${index}`}>{formatDateTime(log.timestamp)}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-sm" data-testid={`log-gate-${index}`}>{log.gate_id}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-muted-foreground" data-testid={`log-user-${index}`}>
                        {log.user_id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="p-4">
                      {log.vehicle_number ? (
                        <div className="bg-yellow-400 text-black font-mono font-bold px-2 py-1 rounded-sm border-2 border-black text-xs inline-block" data-testid={`log-vehicle-${index}`}>
                          {log.vehicle_number}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground" data-testid={`log-purpose-${index}`}>
                      {log.purpose || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      <Card className="bg-card border-border/40 p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Logs:</span>
          <span className="font-bold text-lg" data-testid="total-logs">{logs.length}</span>
        </div>
      </Card>
    </div>
  );
};