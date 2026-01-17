import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const initial = useMemo(() => ({
    name: user?.name || '',
    role: user?.role || '',
    institute_id: user?.institute_id || '',
    phone: user?.phone || '',
    department: user?.department || '',
    roll_no: user?.roll_no || '',
    employee_id: user?.employee_id || '',
    designation: user?.designation || '',
    program: user?.program || '',
    year: user?.year || '',
    address: user?.address || '',
    emergency_contact: user?.emergency_contact || '',
    license_number: user?.license_number || '',
    vehicle_number: user?.vehicle_number || '',
    vehicle_type: user?.vehicle_type || '',
    vehicle_model: user?.vehicle_model || '',
    visitor_purpose: user?.visitor_purpose || '',
    host_name: user?.host_name || '',
    host_department: user?.host_department || '',
    host_contact: user?.host_contact || '',
    current_password: '',
    new_password: ''
  }), [user]);

  const [form, setForm] = useState(initial);

  const role = form.role;
  const showStudent = role === 'Student';
  const showEmployeeLike = role === 'Professor' || role === 'Employee' || role === 'Worker';
  const showVisitor = role === 'Visitor';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // only send editable fields
    const payload = {
      name: form.name,
      phone: form.phone || null,
      department: form.department || null,
      roll_no: showStudent ? (form.roll_no || null) : null,
      employee_id: showEmployeeLike ? (form.employee_id || null) : null,
      designation: showEmployeeLike ? (form.designation || null) : null,
      program: showStudent ? (form.program || null) : null,
      year: showStudent ? (form.year || null) : null,
      address: form.address || null,
      emergency_contact: form.emergency_contact || null,
      license_number: form.license_number || null,
      vehicle_number: form.vehicle_number || null,
      vehicle_type: form.vehicle_type || null,
      vehicle_model: form.vehicle_model || null,
      visitor_purpose: showVisitor ? (form.visitor_purpose || null) : null,
      host_name: showVisitor ? (form.host_name || null) : null,
      host_department: showVisitor ? (form.host_department || null) : null,
      host_contact: showVisitor ? (form.host_contact || null) : null,
    };

    if (form.new_password) {
      payload.current_password = form.current_password || null;
      payload.new_password = form.new_password;
    }

    const res = await updateProfile(payload);
    if (res.success) {
      toast.success('Profile updated');
      setForm((p) => ({ ...p, current_password: '', new_password: '' }));
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Update your personal information and password.</p>
        </div>
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Profile details</CardTitle>
          <CardDescription>Your Aadhaar is stored as a secure hash; only the last 4 digits are shown.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label>Role (read-only)</Label>
                <Select value={form.role} disabled>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Professor">Professor</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Worker">Worker</SelectItem>
                    <SelectItem value="Visitor">Visitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>User ID (read-only)</Label>
                <Input value={form.institute_id} disabled />
              </div>

              {/* Vehicle is captured during registration and can be updated from here */}
              <div className="space-y-2">
                <Label>Vehicle number</Label>
                <Input value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} placeholder="e.g. OD-02-AB-1234" required />
              </div>

              <div className="space-y-2">
                <Label>Vehicle type (optional)</Label>
                <Input value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })} placeholder="2-wheeler / 4-wheeler" />
              </div>

              <div className="space-y-2">
                <Label>Vehicle model (optional)</Label>
                <Input value={form.vehicle_model} onChange={(e) => setForm({ ...form, vehicle_model: e.target.value })} placeholder="Activa / Swift / etc." />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Optional" />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Optional" />
              </div>

              {showStudent && (
                <>
                  <div className="space-y-2">
                    <Label>Roll No</Label>
                    <Input value={form.roll_no} onChange={(e) => setForm({ ...form, roll_no: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Program</Label>
                    <Input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} placeholder="BTech / MTech / PhD" />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="1 / 2 / 3 / 4" />
                  </div>
                </>
              )}

              {showEmployeeLike && (
                <>
                  <div className="space-y-2">
                    <Label>Employee ID</Label>
                    <Input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Professor / Staff / Security / Contractor" />
                  </div>
                </>
              )}

              {showVisitor && (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Visit purpose</Label>
                    <Input value={form.visitor_purpose} onChange={(e) => setForm({ ...form, visitor_purpose: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Host name</Label>
                    <Input value={form.host_name} onChange={(e) => setForm({ ...form, host_name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Host department</Label>
                    <Input value={form.host_department} onChange={(e) => setForm({ ...form, host_department: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Host contact (optional)</Label>
                    <Input value={form.host_contact} onChange={(e) => setForm({ ...form, host_contact: e.target.value })} placeholder="Optional" />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Vehicle number</Label>
                <Input value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} placeholder="Required" />
              </div>
              <div className="space-y-2">
                <Label>Vehicle type (optional)</Label>
                <Input value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })} placeholder="2-wheeler / 4-wheeler" />
              </div>
              <div className="space-y-2">
                <Label>Vehicle model (optional)</Label>
                <Input value={form.vehicle_model} onChange={(e) => setForm({ ...form, vehicle_model: e.target.value })} placeholder="Optional" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Optional" />
              </div>

              <div className="space-y-2">
                <Label>Emergency contact</Label>
                <Input value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} placeholder="Optional" />
              </div>

              <div className="space-y-2">
                <Label>Driving license</Label>
                <Input value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} placeholder="Optional" />
              </div>
            </div>

            <div className="border-t border-border/40 pt-6">
              <h3 className="text-lg font-semibold mb-4">Change password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current password</Label>
                  <Input type="password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} placeholder="Required if already set" />
                </div>
                <div className="space-y-2">
                  <Label>New password</Label>
                  <Input type="password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} placeholder="Leave blank to keep" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="shadow-[0_0_18px_rgba(255,255,255,0.12)]">
                {loading ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
