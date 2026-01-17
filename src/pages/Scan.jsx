import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

function extractUserId(raw) {
  if (!raw) return null;
  const text = String(raw).trim();

  // Case 1: UUID directly
  const uuidRe = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;
  const m1 = text.match(uuidRe);
  if (m1) return m1[0];

  // Case 2: URL param ?user_id=...
  try {
    const u = new URL(text);
    const p = u.searchParams.get('user_id') || u.searchParams.get('uid');
    if (p && uuidRe.test(p)) return p.match(uuidRe)[0];
  } catch (_) {
    // not a URL
  }

  // Case 3: JSON like {"user_id":"..."}
  try {
    const obj = JSON.parse(text);
    const p = obj.user_id || obj.uid || obj.id;
    if (p && uuidRe.test(String(p))) return String(p).match(uuidRe)[0];
  } catch (_) {
    // not JSON
  }

  return null;
}

export function Scan() {
  const { token } = useAuth();
  const backend = useMemo(() => (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, ''), []);

  const [gateId, setGateId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [location, setLocation] = useState('');

  const [lastRaw, setLastRaw] = useState('');
  const [lastUserId, setLastUserId] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const regionId = 'qr-reader-region';
  const qrRef = useRef(null);
  const stopRef = useRef(null);

  useEffect(() => {
    if (!backend) {
      setError('REACT_APP_BACKEND_URL is not set. Set it in GitHub Actions Variables.');
      return;
    }
  }, [backend]);

  async function callScan(userId) {
    setBusy(true);
    setError('');
    setOk('');

    try {
      if (!gateId.trim()) throw new Error('Gate ID is required.');
      if (!userId) throw new Error('Invalid QR content: could not extract user_id (UUID).');

      const payload = {
        user_id: userId,
        gate_id: gateId.trim(),
        location: (location || `Gate ${gateId.trim()}`).trim(),
        purpose: purpose.trim() || null,
        vehicle_number: vehicleNumber.trim() || null,
      };

      const res = await fetch(`${backend}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.detail || `Scan failed (${res.status})`;
        throw new Error(msg);
      }

      setStatus(data?.status || 'OK');
      setOk(`Logged: ${data?.status || 'OK'} for user ${userId}`);
    } catch (e) {
      setError(e?.message || 'Scan failed');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setError('');
      setOk('');

      // Lazy-load to avoid SSR / build issues
      const mod = await import('html5-qrcode');
      const { Html5Qrcode } = mod;

      if (cancelled) return;

      const qr = new Html5Qrcode(regionId);
      qrRef.current = qr;

      const config = { fps: 10, qrbox: { width: 260, height: 260 } };

      await qr.start(
        { facingMode: 'environment' },
        config,
        async (decodedText) => {
          // Debounce by stopping scanner on first read
          if (stopRef.current) return;
          stopRef.current = true;

          setLastRaw(decodedText);
          const uid = extractUserId(decodedText);
          setLastUserId(uid || '');

          await qr.stop().catch(() => {});
          await qr.clear().catch(() => {});

          if (uid) {
            await callScan(uid);
          } else {
            setError('Scanned QR, but could not parse a valid UUID user_id.');
          }
        },
        () => {}
      );
    }

    start().catch((e) => setError(e?.message || 'Failed to start camera.'));

    return () => {
      cancelled = true;
      const qr = qrRef.current;
      if (qr) {
        qr.stop().catch(() => {}).finally(() => qr.clear().catch(() => {}));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canRetry = !busy;

  async function retry() {
    setError('');
    setOk('');
    setStatus('');
    setLastRaw('');
    setLastUserId('');
    stopRef.current = null;

    try {
      const mod = await import('html5-qrcode');
      const { Html5Qrcode } = mod;

      const qr = new Html5Qrcode(regionId);
      qrRef.current = qr;

      const config = { fps: 10, qrbox: { width: 260, height: 260 } };

      await qr.start(
        { facingMode: 'environment' },
        config,
        async (decodedText) => {
          if (stopRef.current) return;
          stopRef.current = true;

          setLastRaw(decodedText);
          const uid = extractUserId(decodedText);
          setLastUserId(uid || '');

          await qr.stop().catch(() => {});
          await qr.clear().catch(() => {});

          if (uid) {
            await callScan(uid);
          } else {
            setError('Scanned QR, but could not parse a valid UUID user_id.');
          }
        },
        () => {}
      );
    } catch (e) {
      setError(e?.message || 'Failed to restart camera.');
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>QR Scan (Gate Logging)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            {ok ? (
              <Alert>
                <AlertDescription>{ok}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Gate ID</Label>
                <Input value={gateId} onChange={(e) => setGateId(e.target.value)} placeholder="e.g., MAIN_GATE" />
              </div>
              <div className="space-y-1">
                <Label>Location (optional)</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Auto if empty" />
              </div>
              <div className="space-y-1">
                <Label>Purpose (optional)</Label>
                <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Visit / Delivery / ..." />
              </div>
              <div className="space-y-1">
                <Label>Vehicle Number (optional)</Label>
                <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="OD-XX-XXXX" />
              </div>
            </div>

            <div className="rounded-lg overflow-hidden border">
              <div id={regionId} className="w-full" />
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={retry} disabled={!canRetry}>Scan Next</Button>
              {busy ? <span className="text-sm text-muted-foreground">Submitting...</span> : null}
              {status ? <span className="text-sm">Last status: <b>{status}</b></span> : null}
            </div>

            {lastRaw ? (
              <div className="text-sm text-muted-foreground">
                <div>Last QR raw: {String(lastRaw).slice(0, 120)}{String(lastRaw).length > 120 ? '…' : ''}</div>
                <div>Parsed user_id: {lastUserId || '—'}</div>
              </div>
            ) : null}

            <div className="text-xs text-muted-foreground">
              Notes: For best reliability, encode the user QR as the user UUID (recommended), or as JSON like {{"user_id":"&lt;uuid&gt;"}}.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
