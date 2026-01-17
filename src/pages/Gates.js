import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Search, Plus, QrCode, Edit, Trash2, DoorOpen, Download, BarChart } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import QRCode from 'qrcode';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Gates = () => {
  const [gates, setGates] = useState([]);
  const [filteredGates, setFilteredGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedGate, setSelectedGate] = useState(null);
  const [gateStats, setGateStats] = useState(null);
  const [formData, setFormData] = useState({
    gate_id: '',
    name: '',
    location: '',
    gate_type: 'Main Gate',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchGates();
  }, []);

  useEffect(() => {
    filterGates();
  }, [gates, searchTerm]);

  const fetchGates = async () => {
    try {
      const response = await axios.get(`${API}/gates`);
      setGates(response.data);
      setFilteredGates(response.data);
    } catch (error) {
      console.error('Failed to fetch gates:', error);
      toast.error('Failed to load gates');
    } finally {
      setLoading(false);
    }
  };

  const filterGates = () => {
    if (searchTerm) {
      const filtered = gates.filter(gate =>
        gate.gate_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gate.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGates(filtered);
    } else {
      setFilteredGates(gates);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/gates`, formData);
      toast.success('Gate registered successfully!');
      setShowAddDialog(false);
      resetForm();
      fetchGates();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to register gate');
    }
  };

  const resetForm = () => {
    setFormData({
      gate_id: '',
      name: '',
      location: '',
      gate_type: 'Main Gate',
      description: '',
      is_active: true
    });
  };

  const handleToggleActive = async (gate) => {
    try {
      await axios.put(`${API}/gates/${gate.gate_id}`, {
        is_active: !gate.is_active
      });
      toast.success(`Gate ${gate.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchGates();
    } catch (error) {
      toast.error('Failed to update gate status');
    }
  };

  const handleDelete = async (gateId) => {
    if (!window.confirm('Are you sure you want to delete this gate?')) return;
    
    try {
      await axios.delete(`${API}/gates/${gateId}`);
      toast.success('Gate deleted successfully');
      fetchGates();
    } catch (error) {
      toast.error('Failed to delete gate');
    }
  };

  const handleShowQR = async (gate) => {
    setSelectedGate(gate);
    setShowQRDialog(true);
    
    // Fetch gate stats
    try {
      const response = await axios.get(`${API}/gates/${gate.gate_id}/stats`);
      setGateStats(response.data);
    } catch (error) {
      console.error('Failed to fetch gate stats:', error);
    }
  };

  const downloadQRCode = async () => {
    if (!selectedGate) return;
    
    try {
      const qrData = JSON.stringify({
        gate_id: selectedGate.gate_id,
        location: selectedGate.location
      });
      
      const canvas = document.getElementById('qrCanvas');
      await QRCode.toCanvas(canvas, qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Download
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${selectedGate.gate_id}_QR_CODE.png`;
      link.href = url;
      link.click();
      
      toast.success('QR Code downloaded!');
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  const getGateTypeColor = (type) => {
    const colors = {
      'Main Gate': 'bg-red-500/10 text-red-500 border-red-500/20',
      'Side Gate': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'Laboratory': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Hostel': 'bg-green-500/10 text-green-500 border-green-500/20',
      'Administrative': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'Facility': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      'Parking': 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };
    return colors[type] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
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
          <h1 className="text-4xl font-bold mb-2" data-testid="gates-title">Gate Management</h1>
          <p className="text-muted-foreground">Register and manage all gates, labs, and access points</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground" data-testid="add-gate-button">
              <Plus className="w-4 h-4 mr-2" />
              Register New Gate
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card text-foreground max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register New Gate/Access Point</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gate_id">Gate ID *</Label>
                  <Input
                    id="gate_id"
                    placeholder="e.g., MAIN_GATE_01"
                    value={formData.gate_id}
                    onChange={(e) => setFormData({ ...formData, gate_id: e.target.value.toUpperCase() })}
                    required
                    className="bg-secondary/50"
                  />
                  <small className="text-muted-foreground text-xs">Unique identifier (uppercase)</small>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Gate Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Gate"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., IIT_BBS_MAIN or Computer Science Block"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gate_type">Gate Type *</Label>
                <Select value={formData.gate_type} onValueChange={(value) => setFormData({ ...formData, gate_type: value })}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Gate">Main Gate</SelectItem>
                    <SelectItem value="Side Gate">Side Gate</SelectItem>
                    <SelectItem value="Laboratory">Laboratory</SelectItem>
                    <SelectItem value="Hostel">Hostel</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                    <SelectItem value="Facility">Facility</SelectItem>
                    <SelectItem value="Parking">Parking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Primary entrance to campus"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="is_active" className="cursor-pointer">Active (ready for scanning)</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Register Gate</Button>
                <Button type="button" variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="bg-card border-border/40 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by gate ID, name, or location..."
            data-testid="search-input"
            className="pl-10 bg-secondary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Gates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <DoorOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No gates registered yet</p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Register First Gate
            </Button>
          </div>
        ) : (
          filteredGates.map((gate, index) => (
            <Card
              key={gate.gate_id}
              className="bg-card border-border/40 p-6 hover:border-primary/50 transition-all duration-200"
              data-testid={`gate-card-${index}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1" data-testid={`gate-name-${index}`}>{gate.name}</h3>
                  <p className="text-sm font-mono text-muted-foreground" data-testid={`gate-id-${index}`}>{gate.gate_id}</p>
                </div>
                <Badge className={`${getGateTypeColor(gate.gate_type)} border`} data-testid={`gate-type-${index}`}>
                  {gate.gate_type}
                </Badge>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium" data-testid={`gate-location-${index}`}>{gate.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entries:</span>
                  <span className="font-medium text-green-500" data-testid={`gate-entries-${index}`}>{gate.total_entries || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exits:</span>
                  <span className="font-medium text-orange-500" data-testid={`gate-exits-${index}`}>{gate.total_exits || 0}</span>
                </div>
                {gate.description && (
                  <p className="text-muted-foreground text-xs pt-2 border-t border-border/40">{gate.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <Badge className={gate.is_active ? 'status-allowed border' : 'status-blocked border'} data-testid={`gate-status-${index}`}>
                  {gate.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShowQR(gate)}
                    data-testid={`view-qr-${index}`}
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(gate)}
                  >
                    <DoorOpen className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(gate.gate_id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="bg-card text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gate QR Code & Statistics</DialogTitle>
          </DialogHeader>
          {selectedGate && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{selectedGate.name}</h3>
                <p className="text-sm text-muted-foreground font-mono">{selectedGate.gate_id}</p>
                <p className="text-sm text-muted-foreground">{selectedGate.location}</p>
              </div>

              <div className="flex justify-center p-6 bg-secondary/30 rounded-lg">
                <canvas id="qrCanvas" className="border-4 border-white rounded-lg"></canvas>
              </div>

              {gateStats && (
                <Card className="bg-secondary/30 p-4">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <BarChart className="w-4 h-4" />
                    Gate Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Entries Today</p>
                      <p className="text-2xl font-bold text-green-500">{gateStats.entries_today}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Exits Today</p>
                      <p className="text-2xl font-bold text-orange-500">{gateStats.exits_today}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Entries</p>
                      <p className="text-2xl font-bold">{gateStats.total_entries}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Exits</p>
                      <p className="text-2xl font-bold">{gateStats.total_exits}</p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">QR Code Data:</p>
                <code className="text-xs font-mono bg-background p-2 rounded block">
                  {JSON.stringify({ gate_id: selectedGate.gate_id, location: selectedGate.location }, null, 2)}
                </code>
              </div>

              <div className="flex gap-2">
                <Button onClick={downloadQRCode} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
                <Button variant="outline" onClick={() => setShowQRDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary */}
      <Card className="bg-card border-border/40 p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Registered Gates:</span>
          <span className="font-bold text-lg" data-testid="total-gates">{gates.length}</span>
        </div>
      </Card>
    </div>
  );
};
