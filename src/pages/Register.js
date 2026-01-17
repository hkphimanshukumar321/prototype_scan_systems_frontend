import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Sparkles, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
  { value: 'Student', label: 'Student' },
  { value: 'Professor', label: 'Professor' },
  { value: 'Employee', label: 'Employee' },
  { value: 'Worker', label: 'Worker' },
  { value: 'Visitor', label: 'Visitor' }
];

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    role: 'Student',
    institute_id: '',
    password: '',
    phone: '',
    aadhaar_number: '',
    department: '',
    roll_no: '',
    employee_id: '',
    designation: '',
    program: '',
    year: '',
    address: '',
    emergency_contact: '',
    vehicle_number: '',
    vehicle_type: '',
    vehicle_model: '',
    visitor_purpose: '',
    host_name: '',
    host_department: '',
    host_contact: ''
  });

  const requirements = useMemo(() => {
    const role = form.role;
    return {
      roll_no: role === 'Student',
      employee_id: role !== 'Student' && role !== 'Visitor',
      designation: role === 'Professor',
      visitor_fields: role === 'Visitor',
      phone_required: role === 'Visitor'
    };
  }, [form.role]);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic client-side validation (backend enforces as source of truth)
      if (!form.name.trim()) throw new Error('Name is required');
      if (requirements.phone_required) {
        if (!form.phone.trim()) throw new Error('Phone is required for visitors');
      } else {
        if (!form.institute_id.trim() && !form.phone.trim()) throw new Error('User ID (Institute ID) or phone is required');
      }
      if (!form.password) throw new Error('Password is required');
      if (!/^[0-9]{12}$/.test(form.aadhaar_number.replace(/\s/g, ''))) throw new Error('Aadhaar must be exactly 12 digits');
      if (requirements.roll_no && !form.roll_no.trim()) throw new Error('Roll No is required for students');
      if (requirements.employee_id && !form.employee_id.trim()) throw new Error('Employee ID is required');
      if (requirements.designation && !form.designation.trim()) throw new Error('Designation is required for professors');
      if (requirements.visitor_fields) {
        if (!form.visitor_purpose.trim()) throw new Error('Purpose is required for visitors');
        if (!form.host_name.trim()) throw new Error('Host name is required for visitors');
        if (!form.host_department.trim()) throw new Error('Host department is required for visitors');
      }

      if (!form.vehicle_number.trim()) throw new Error('Vehicle number is required');

      const payload = {
        name: form.name,
        role: form.role,
        institute_id: form.institute_id || null,
        phone: form.phone || null,
        password: form.password,
        aadhaar_number: form.aadhaar_number,
        department: form.department || null,
        roll_no: form.role === 'Student' ? form.roll_no : null,
        employee_id: (form.role !== 'Student' && form.role !== 'Visitor') ? form.employee_id : null,
        designation: form.designation || null,
        program: form.program || null,
        year: form.year || null,
        address: form.address || null,
        emergency_contact: form.emergency_contact || null
        ,vehicle_number: form.vehicle_number || null
        ,vehicle_type: form.vehicle_type || null
        ,vehicle_model: form.vehicle_model || null
        ,visitor_purpose: form.visitor_purpose || null
        ,host_name: form.host_name || null
        ,host_department: form.host_department || null
        ,host_contact: form.host_contact || null
      };

      const result = await register(payload);
      if (result.success) {
        toast.success('Account created. Welcome!');
        navigate('/dashboard');
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (err) {
      const msg = err?.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-background to-secondary/30">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 shadow-[0_0_30px_rgba(255,255,255,0.08)] mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Scan Systems</h1>
          <p className="text-muted-foreground">Create your account to start logging entries/exits</p>
        </div>

        <Card className="bg-card/80 backdrop-blur border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5" /> Self Signup</CardTitle>
            <CardDescription>
              Fill details based on your role. Aadhaar is stored as a secure hash.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your full name" required />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => update('role', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>User ID (Institute ID)</Label>
                  <Input value={form.institute_id} onChange={(e) => update('institute_id', e.target.value)} placeholder="Roll / Employee ID to login" />
                  <p className="text-xs text-muted-foreground">Use this as your login ID (recommended).</p>
                </div>

                <div className="space-y-2">
                  <Label>Phone (optional)</Label>
                  <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="10-digit phone" />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Create a password" required />
                </div>

                <div className="space-y-2">
                  <Label>Aadhaar Number</Label>
                  <Input value={form.aadhaar_number} onChange={(e) => update('aadhaar_number', e.target.value)} placeholder="12-digit Aadhaar" required />
                </div>

                <div className="space-y-2">
                  <Label>Department (optional)</Label>
                  <Input value={form.department} onChange={(e) => update('department', e.target.value)} placeholder="CSE / EE / Admin..." />
                </div>

                {form.role === 'Student' ? (
                  <div className="space-y-2">
                    <Label>Roll No</Label>
                    <Input value={form.roll_no} onChange={(e) => update('roll_no', e.target.value)} placeholder="Your roll number" required={requirements.roll_no} />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Employee ID</Label>
                      <Input value={form.employee_id} onChange={(e) => update('employee_id', e.target.value)} placeholder="Employee / Worker ID" required={requirements.employee_id} />
                    </div>
                    <div className="space-y-2">
                      <Label>Designation {requirements.designation ? '(required)' : '(optional)'}</Label>
                      <Input value={form.designation} onChange={(e) => update('designation', e.target.value)} placeholder="Professor / Staff / Contract..." required={requirements.designation} />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Vehicle Number</Label>
                  <Input value={form.vehicle_number} onChange={(e) => update('vehicle_number', e.target.value.toUpperCase())} placeholder="OD-02-AB-1234" required />
                  <p className="text-xs text-muted-foreground">Stored with your profile (no vehicle scanning needed).</p>
                </div>

                <div className="space-y-2">
                  <Label>Vehicle Type (optional)</Label>
                  <Input value={form.vehicle_type} onChange={(e) => update('vehicle_type', e.target.value)} placeholder="2-wheeler / 4-wheeler" />
                </div>

                <div className="space-y-2">
                  <Label>Vehicle Model (optional)</Label>
                  <Input value={form.vehicle_model} onChange={(e) => update('vehicle_model', e.target.value)} placeholder="Activa / i20 / etc." />
                </div>

                {requirements.visitor_fields && (
                  <>
                    <div className="space-y-2">
                      <Label>Purpose of Visit</Label>
                      <Input value={form.visitor_purpose} onChange={(e) => update('visitor_purpose', e.target.value)} placeholder="Meeting / Delivery / Maintenance" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Host Name</Label>
                      <Input value={form.host_name} onChange={(e) => update('host_name', e.target.value)} placeholder="Faculty / Office contact" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Host Department</Label>
                      <Input value={form.host_department} onChange={(e) => update('host_department', e.target.value)} placeholder="CSE / EE / Admin" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Host Contact (optional)</Label>
                      <Input value={form.host_contact} onChange={(e) => update('host_contact', e.target.value)} placeholder="Phone / Email" />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Program (optional)</Label>
                  <Input value={form.program} onChange={(e) => update('program', e.target.value)} placeholder="B.Tech / M.Tech / PhD / NA" />
                </div>

                <div className="space-y-2">
                  <Label>Year (optional)</Label>
                  <Input value={form.year} onChange={(e) => update('year', e.target.value)} placeholder="1 / 2 / 3 / 4" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Address (optional)</Label>
                  <Input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="City, State" />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact (optional)</Label>
                  <Input value={form.emergency_contact} onChange={(e) => update('emergency_contact', e.target.value)} placeholder="Phone / Guardian" />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" className="flex-1 shadow-[0_0_18px_rgba(255,255,255,0.12)]" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/login')} disabled={loading}>
                  Back to Login
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
