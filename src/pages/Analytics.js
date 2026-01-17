import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2" data-testid="analytics-title">Analytics</h1>
        <p className="text-muted-foreground">Detailed insights and statistics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/40 p-6" data-testid="metric-entries">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Total Entries</p>
              <p className="text-4xl font-bold mt-2">{analytics.total_entries_today}</p>
            </div>
            <ArrowDownCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="bg-card border-border/40 p-6" data-testid="metric-exits">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Total Exits</p>
              <p className="text-4xl font-bold mt-2">{analytics.total_exits_today}</p>
            </div>
            <ArrowUpCircle className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card className="bg-card border-border/40 p-6" data-testid="metric-inside">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Currently Inside</p>
              <p className="text-4xl font-bold mt-2">{analytics.current_inside}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="bg-card border-border/40 p-6" data-testid="metric-visitors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Visitors Today</p>
              <p className="text-4xl font-bold mt-2">{analytics.total_visitors_today}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Hourly Activity Chart */}
      <Card className="bg-card border-border/40 p-6" data-testid="hourly-chart">
        <h2 className="text-xl font-bold mb-6">Hourly Activity</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.hourly_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis 
                dataKey="hour" 
                stroke="#a1a1aa"
                style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
              />
              <YAxis 
                stroke="#a1a1aa"
                style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  fontFamily: 'IBM Plex Sans'
                }}
              />
              <Bar dataKey="entries" fill="#22c55e" name="Entries" />
              <Bar dataKey="exits" fill="#f59e0b" name="Exits" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Entry/Exit Trend */}
      <Card className="bg-card border-border/40 p-6" data-testid="trend-chart">
        <h2 className="text-xl font-bold mb-6">Entry/Exit Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.hourly_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis 
                dataKey="hour" 
                stroke="#a1a1aa"
                style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
              />
              <YAxis 
                stroke="#a1a1aa"
                style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  fontFamily: 'IBM Plex Sans'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="entries" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Entries"
              />
              <Line 
                type="monotone" 
                dataKey="exits" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Exits"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
