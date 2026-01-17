import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Bell, Shield, Database, Download } from 'lucide-react';

export const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2" data-testid="settings-title">Settings</h1>
        <p className="text-muted-foreground">System configuration and preferences</p>
      </div>

      {/* System Status */}
      <Card className="bg-card border-border/40 p-6" data-testid="system-status">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">System Status</h2>
            <p className="text-sm text-muted-foreground">All services operational</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
            <span className="text-sm">Database Connection</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-500" data-testid="db-status">Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
            <span className="text-sm">WebSocket Server</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-500" data-testid="ws-status">Active</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border/40 p-6" data-testid="notifications">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Notifications</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Real-time Alerts</p>
              <p className="text-sm text-muted-foreground">Receive instant notifications for gate scans</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Reports</p>
              <p className="text-sm text-muted-foreground">Daily summary reports</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="bg-card border-border/40 p-6" data-testid="data-management">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Data Management</h2>
        </div>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" data-testid="export-data">
            <Download className="w-4 h-4 mr-2" />
            Export Activity Logs
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export User Database
          </Button>
        </div>
      </Card>

      {/* Security */}
      <Card className="bg-card border-border/40 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Security Settings</h2>
        </div>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">Change Password</Button>
          <Button variant="outline" className="w-full justify-start">Manage Access Control</Button>
          <Button variant="outline" className="w-full justify-start">View Audit Logs</Button>
        </div>
      </Card>
    </div>
  );
};