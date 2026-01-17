import React, { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Activity, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Users as UsersIcon, 
  Clock,
  Car,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatTime, formatDateTime } from '@/lib/utils';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Dashboard = () => {
  const { scanAlerts, connected } = useSocket();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [myStatus, setMyStatus] = useState(null);

  const isSecurity = (user?.role || '').toLowerCase() === 'security' || (user?.role || '').toLowerCase() === 'admin';

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [isSecurity]);

  const fetchDashboardData = async () => {
    try {
      if (isSecurity) {
        const [analyticsRes, logsRes] = await Promise.all([
          axios.get(`${API}/analytics`),
          axios.get(`${API}/logs?limit=10`)
        ]);
        setStats(analyticsRes.data);
        setRecentLogs(logsRes.data);
      } else {
        const [statusRes, logsRes] = await Promise.all([
          axios.get(`${API}/status/me`),
          axios.get(`${API}/logs?limit=10`)
        ]);
        setMyStatus(statusRes.data);
        setRecentLogs(logsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'IN') {
      return (
        <Badge className="status-allowed border px-3 py-1 font-mono text-xs uppercase tracking-wider" data-testid={`status-badge-${status}`}>
          <ArrowDownCircle className="w-3 h-3 mr-1" />
          Entry
        </Badge>
      );
    } else if (status === 'OUT') {
      return (
        <Badge className="status-pending border px-3 py-1 font-mono text-xs uppercase tracking-wider" data-testid={`status-badge-${status}`}>
          <ArrowUpCircle className="w-3 h-3 mr-1" />
          Exit
        </Badge>
      );
    } else {
      return (
        <Badge className="status-blocked border px-3 py-1 font-mono text-xs uppercase tracking-wider" data-testid={`status-badge-${status}`}>
          <AlertTriangle className="w-3 h-3 mr-1" />
          Blocked
        </Badge>
      );
    }
  };

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2" data-testid="dashboard-title">
            {isSecurity ? 'Security Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {isSecurity ? 'Real-time monitoring of gate activities' : 'Scan a gate QR to log entry/exit and view your status'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border/40 rounded-md">
          <div className={cn(
            "w-2 h-2 rounded-full",
            connected ? "bg-green-500 animate-pulse" : "bg-red-500"
          )} />
          <span className="text-sm font-medium mono" data-testid="connection-status">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {!isSecurity && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border/40 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">My Status</p>
                <p className="text-3xl font-bold mt-2">
                  {myStatus?.inside ? 'Inside' : 'Outside'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {myStatus?.location ? `Last gate: ${myStatus.location}` : 'No scans yet'}
                </p>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                myStatus?.inside ? "bg-green-500/10" : "bg-amber-500/10"
              )}>
                <CheckCircle2 className={cn("w-6 h-6", myStatus?.inside ? "text-green-500" : "text-amber-500")} />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {myStatus?.timestamp ? `Last scan: ${formatDateTime(myStatus.timestamp)}` : ''}
            </div>
          </Card>
          <Card className="bg-card border-border/40 p-6 md:col-span-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Quick tips</p>
            <ul className="mt-3 text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Scan the QR pasted at the gate/lab to toggle Entry/Exit automatically.</li>
              <li>Security staff can see your profile details and scan activity in real time.</li>
            </ul>
          </Card>
        </div>
      )}

      {/* Stats Grid */}
      {isSecurity && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border/40 p-6" data-testid="stat-entries">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Total Entries</p>
                <p className="text-3xl font-bold mt-2">{stats.total_entries_today}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <ArrowDownCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border/40 p-6" data-testid="stat-exits">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Total Exits</p>
                <p className="text-3xl font-bold mt-2">{stats.total_exits_today}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border/40 p-6" data-testid="stat-inside">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Currently Inside</p>
                <p className="text-3xl font-bold mt-2">{stats.current_inside}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border/40 p-6" data-testid="stat-visitors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Visitors Today</p>
                <p className="text-3xl font-bold mt-2">{stats.total_visitors_today}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Grid: Live Alerts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Scan Alerts - Takes 2 columns */}
        <Card className="lg:col-span-2 bg-card border-border/40" data-testid="live-alerts-section">
          <div className="p-6 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Live Scan Alerts</h2>
                <p className="text-sm text-muted-foreground mt-1">Real-time gate activity</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="w-4 h-4 animate-pulse text-green-500" />
                <span className="mono">{scanAlerts.length} alerts</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            <AnimatePresence>
              {scanAlerts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Waiting for scan activity...</p>
                  <p className="text-xs mt-2">Alerts will appear here in real-time</p>
                </div>
              ) : (
                scanAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.log_id || index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="bg-secondary/50 border border-border/40 rounded-md p-4 hover:border-primary/50 transition-all duration-200"
                    data-testid={`scan-alert-${index}`}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 border-2 border-border">
                        <AvatarImage src={alert.user?.photo_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {getUserInitials(alert.user?.name || 'Unknown')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg" data-testid={`alert-user-name-${index}`}>{alert.user?.name}</h3>
                            <p className="text-sm text-muted-foreground">{alert.user?.role} {alert.user?.department && `• ${alert.user.department}`}</p>
                          </div>
                          {getStatusBadge(alert.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="mono text-xs" data-testid={`alert-time-${index}`}>{formatTime(alert.timestamp)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <span className="mono text-xs" data-testid={`alert-gate-${index}`}>{alert.gate_id}</span>
                          </div>
                        </div>

                        {alert.vehicle_number && (
                          <div className="mt-3 flex items-center gap-2">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <div className="bg-yellow-400 text-black font-mono font-bold px-2 py-1 rounded-sm border-2 border-black text-xs" data-testid={`alert-vehicle-${index}`}>
                              {alert.vehicle_number}
                            </div>
                          </div>
                        )}

                        {alert.purpose && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Purpose: <span className="text-foreground">{alert.purpose}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Recent Activity - 1 column */}
        <Card className="bg-card border-border/40" data-testid="recent-activity-section">
          <div className="p-6 border-b border-border/40">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <p className="text-sm text-muted-foreground mt-1">Last 10 entries</p>
          </div>

          <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
              </div>
            ) : (
              recentLogs.map((log, index) => (
                <div
                  key={log.log_id}
                  className="p-3 bg-secondary/30 border border-border/20 rounded-md hover:bg-secondary/50 transition-colors"
                  data-testid={`recent-log-${index}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm" data-testid={`recent-log-gate-${index}`}>{log.gate_id}</span>
                    {log.status === 'IN' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowUpCircle className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mono" data-testid={`recent-log-time-${index}`}>{formatDateTime(log.timestamp)}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Peak Hour Info */}
      {stats && (
        <Card className="bg-card border-border/40 p-6" data-testid="peak-hour-info">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Peak Hour Today</p>
              <p className="text-2xl font-bold mt-1 mono" data-testid="peak-hour-value">{stats.peak_hour}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};