import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

// Gate QR formats supported:
// 1) JSON: {"gate_id":"GATE-1","location":"Main Gate"}
// 2) URL:  https://.../?gate_id=GATE-1&location=Main%20Gate
// 3) Plain: GATE-1

function extractGatePayload(raw) {
  if (!raw) return null;
  const text = String(raw).trim();

  // JSON payload
  try {
    const obj = JSON.parse(text);
    const gateId = obj.gate_id || obj.gateId || obj.id;
    if (gateId) {
      return {
        gate_id: String(gateId).trim(),
        location: obj.location ? String(obj.location).trim() : '',
      };
    }
  } catch (_) {
    // not JSON
  }

  // URL payload
  try {
    const u = new URL(text);
    const gateId = u.searchParams.get('gate_id') || u.searchParams.get('gateId') || u.searchParams.get('id');
    if (gateId) {
      return {
        gate_id: String(gateId).trim(),
        location: (u.searchParams.get('location') || '').trim(),
      };
    }
  } catch (_) {
    // not a URL
  }

  // Plain value fallback
  if (text.length >= 2 && text.length <= 64) {
    return { gate_id: text, location: '' };
  }

  return null;
}

export const Scan = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [purpose, setPurpose] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const [lastRaw, setLastRaw] = useState('');
  const [gatePayload, setGatePayload] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const scannerRef = useRef(null);
  const containerId = useMemo(() => 'qr-reader', []);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let stopped = false;

    async function start() {
      try {
        const mod = await import('html5-qrcode');
        const Html5Qrcode = mod.Html5Qrcode;

        const html5Qrcode = new Html5Qrcode(containerId);
        scannerRef.current = html5Qrcode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        };

        await html5Qrcode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (stopped) return;
            setLastRaw(decodedText);
            const payload = extractGatePayload(decodedText);
            if (payload?.gate_id) {
              setGatePayload(payload);
            }
          },
          () => {}
        );

        setCameraReady(true);
        setCameraError('');
      } catch (e) {
        setCameraReady(false);
        setCameraError(e?.message || 'Unable to access camera.');
      }
    }

    start();

    return () => {
      stopped = true;
      (async () => {
        try {
          if (scannerRef.current) {
            await scannerRef.current.stop();
            await scannerRef.current.clear();
          }
        } catch (_) {
          // ignore
        }
      })();
    };
  }, [containerId]);

  async function submitScan() {
    if (!backendUrl) {
      toast.error('Missing REACT_APP_BACKEND_URL.');
      return;
    }
    if (!gatePayload?.gate_id) {
      toast.error('Scan a valid Gate QR first.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gate_id: gatePayload.gate_id,
          location: gatePayload.location || null,
          purpose: purpose.trim() || null,
          vehicle_number: vehicleNumber.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.detail || `Scan failed (${res.status})`);
        return;
      }

      toast.success(`Logged ${data.status} at ${data.gate_id}`);
      setPurpose('');
      setVehicleNumber('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scan Gate QR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div id={containerId} className="w-full rounded-lg overflow-hidden bg-muted" />

            {!cameraReady && cameraError ? (
              <Alert variant="destructive">
                <AlertTitle>Camera error</AlertTitle>
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label>Last scanned</Label>
              <div className="rounded-md border p-3 text-sm break-words">
                {gatePayload?.gate_id ? (
                  <div className="space-y-1">
                    <div><span className="font-semibold">Gate ID:</span> {gatePayload.gate_id}</div>
                    {gatePayload.location ? (
                      <div><span className="font-semibold">Location:</span> {gatePayload.location}</div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    Scan the QR pasted at the gate/lab. The QR must contain a gate_id.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose (optional)</Label>
              <Input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g., Lab session" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle number (optional)</Label>
              <Input id="vehicle" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="OD-xx-xxxx" />
            </div>

            <Button className="w-full" disabled={busy || !gatePayload?.gate_id} onClick={submitScan}>
              {busy ? 'Logging…' : 'Log Entry/Exit'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Security registers each gate/lab in the dashboard and prints the gate QR.
              Students, professors, and workers open this page on their phone and scan the gate QR.
            </p>
            <p>
              The backend automatically alternates your status between <span className="font-semibold">IN</span> and <span className="font-semibold">OUT</span>
              based on your last scan.
            </p>
            {lastRaw ? (
              <div className="rounded-md border p-3 text-xs break-words">
                <div className="font-semibold mb-1">Raw QR data (debug)</div>
                {lastRaw}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
