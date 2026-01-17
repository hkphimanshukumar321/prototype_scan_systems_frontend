import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Car as CarIcon, Plus } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchTerm]);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API}/vehicles`);
      setVehicles(response.data);
      setFilteredVehicles(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    if (searchTerm) {
      const filtered = vehicles.filter(vehicle =>
        vehicle.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
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
          <h1 className="text-4xl font-bold mb-2" data-testid="vehicles-title">Vehicle Registry</h1>
          <p className="text-muted-foreground">Registered vehicles database</p>
        </div>
        <Button className="bg-primary text-primary-foreground" data-testid="add-vehicle-button">
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border/40 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by vehicle number or model..."
            data-testid="vehicle-search"
            className="pl-10 bg-secondary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Vehicles Table */}
      <Card className="bg-card border-border/40">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/40">
              <tr>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Vehicle Number</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Type</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Model</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Owner ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-muted-foreground">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle, index) => (
                  <tr 
                    key={vehicle.id} 
                    className="border-b border-border/20 hover:bg-secondary/30 transition-colors"
                    data-testid={`vehicle-row-${index}`}
                  >
                    <td className="p-4">
                      <div className="bg-yellow-400 text-black font-mono font-bold px-3 py-1 rounded-sm border-2 border-black text-sm inline-block" data-testid={`vehicle-number-${index}`}>
                        {vehicle.vehicle_number}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 border" data-testid={`vehicle-type-${index}`}>
                        <CarIcon className="w-3 h-3 mr-1" />
                        {vehicle.vehicle_type}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm" data-testid={`vehicle-model-${index}`}>{vehicle.model || 'N/A'}</td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-muted-foreground" data-testid={`vehicle-owner-${index}`}>{vehicle.user_id.substring(0, 8)}...</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border/40 p-6" data-testid="vehicle-summary">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Total Vehicles</p>
          <p className="text-3xl font-bold mt-2" data-testid="total-vehicles">{vehicles.length}</p>
        </Card>
        <Card className="bg-card border-border/40 p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">2-Wheelers</p>
          <p className="text-3xl font-bold mt-2" data-testid="two-wheelers">
            {vehicles.filter(v => v.vehicle_type === '2-wheeler').length}
          </p>
        </Card>
        <Card className="bg-card border-border/40 p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">4-Wheelers</p>
          <p className="text-3xl font-bold mt-2" data-testid="four-wheelers">
            {vehicles.filter(v => v.vehicle_type === '4-wheeler').length}
          </p>
        </Card>
      </div>
    </div>
  );
};