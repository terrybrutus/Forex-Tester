import { useState } from "react";
import { getDefaultSettings } from "@/engines/riskEngine";
import type { PropFirmSettings } from "@/types";

export function SettingsPage() {
  const [settings, setSettings] = useState<PropFirmSettings>(() => {
    try {
      const stored = localStorage.getItem("propFirmSettings");
      return stored ? (JSON.parse(stored) as PropFirmSettings) : getDefaultSettings();
    } catch {
      return getDefaultSettings();
    }
  });
  const [saved, setSaved] = useState(false);

  function handleChange<K extends keyof PropFirmSettings>(
    key: K,
    value: PropFirmSettings[K],
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem("propFirmSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    const defaults = getDefaultSettings();
    setSettings(defaults);
    localStorage.removeItem("propFirmSettings");
    setSaved(false);
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Prop Firm Settings</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        <SettingsSection title="Account">
          <NumberField
            label="Account Size ($)"
            value={settings.accountSize}
            onChange={(v) => handleChange("accountSize", v)}
          />
          <TextField
            label="Firm Name"
            value={settings.firmName}
            onChange={(v) => handleChange("firmName", v)}
          />
        </SettingsSection>

        <SettingsSection title="Risk Limits">
          <NumberField
            label="Daily Loss Limit (%)"
            value={settings.dailyLossPercent}
            onChange={(v) => handleChange("dailyLossPercent", v)}
            step={0.5}
            min={1}
            max={20}
          />
          <NumberField
            label="Max Total Loss (%)"
            value={settings.maxLossPercent}
            onChange={(v) => handleChange("maxLossPercent", v)}
            step={0.5}
            min={2}
            max={30}
          />
          <NumberField
            label="Profit Target (%)"
            value={settings.profitTargetPercent}
            onChange={(v) => handleChange("profitTargetPercent", v)}
            step={0.5}
          />
          <NumberField
            label="Max Risk Per Trade (%)"
            value={settings.maxRiskPerTrade}
            onChange={(v) => handleChange("maxRiskPerTrade", v)}
            step={0.1}
            min={0.1}
            max={5}
          />
          <NumberField
            label="Max Trades Per Day"
            value={settings.maxTradesPerDay}
            onChange={(v) => handleChange("maxTradesPerDay", v)}
            step={1}
            min={1}
            max={20}
          />
          <NumberField
            label="Min Profitable Days"
            value={settings.minProfitableDays}
            onChange={(v) => handleChange("minProfitableDays", v)}
            step={1}
            min={0}
          />
        </SettingsSection>

        <SettingsSection title="Trading Rules">
          <BoolField
            label="News Trading Allowed"
            value={settings.newsTrading}
            onChange={(v) => handleChange("newsTrading", v)}
          />
          <BoolField
            label="Overnight Holding Allowed"
            value={settings.overnightHolding}
            onChange={(v) => handleChange("overnightHolding", v)}
          />
          <BoolField
            label="Weekend Holding Allowed"
            value={settings.weekendHolding}
            onChange={(v) => handleChange("weekendHolding", v)}
          />
          <BoolField
            label="EA/Automation Allowed"
            value={settings.eaAutomation}
            onChange={(v) => handleChange("eaAutomation", v)}
          />
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

function NumberField({ label, value, onChange, step = 1, min, max }: NumberFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-muted-foreground">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-28 px-2 py-1 text-right font-mono text-sm bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
      />
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function TextField({ label, value, onChange }: TextFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-muted-foreground">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-40 px-2 py-1 text-sm bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
      />
    </div>
  );
}

interface BoolFieldProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function BoolField({ label, value, onChange }: BoolFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-muted-foreground">{label}</label>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          value ? "bg-primary" : "bg-secondary border border-border"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
