'use client';

import { useState } from 'react';
import { Palette, X, RotateCcw } from 'lucide-react';

interface BackgroundSettings {
  color1: string;
  color2: string;
  color3: string;
  timeSpeed: number;
  warpStrength: number;
  warpSpeed: number;
  grainAmount: number;
  contrast: number;
  saturation: number;
  zoom: number;
}

const DEFAULT_SETTINGS: BackgroundSettings = {
  color1: '#8B5CF6',
  color2: '#6366F1',
  color3: '#1a1625',
  timeSpeed: 0.15,
  warpStrength: 0.8,
  warpSpeed: 1.0,
  grainAmount: 0.05,
  contrast: 1.2,
  saturation: 0.9,
  zoom: 1.0,
};

const COLOR_PRESETS = [
  { name: 'Paars', color1: '#8B5CF6', color2: '#6366F1', color3: '#1a1625' },
  { name: 'Blauw', color1: '#3B82F6', color2: '#06B6D4', color3: '#0f172a' },
  { name: 'Groen', color1: '#10B981', color2: '#22D3EE', color3: '#0f1a14' },
  { name: 'Roze', color1: '#EC4899', color2: '#F472B6', color3: '#1a1520' },
  { name: 'Oranje', color1: '#F97316', color2: '#FBBF24', color3: '#1a1510' },
  { name: 'Rood', color1: '#EF4444', color2: '#F97316', color3: '#1a1212' },
];

interface BackgroundControlsProps {
  settings: BackgroundSettings;
  onSettingsChange: (settings: BackgroundSettings) => void;
}

export function BackgroundControls({ settings, onSettingsChange }: BackgroundControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof BackgroundSettings, value: number | string) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleReset = () => {
    onSettingsChange(DEFAULT_SETTINGS);
  };

  const handlePreset = (preset: typeof COLOR_PRESETS[0]) => {
    onSettingsChange({
      ...settings,
      color1: preset.color1,
      color2: preset.color2,
      color3: preset.color3,
    });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50
          w-12 h-12 rounded-full
          flex items-center justify-center
          transition-all duration-300 shadow-lg
          ${isOpen
            ? 'bg-white/20 rotate-180'
            : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:scale-110'
          }
          border border-white/20 backdrop-blur-sm
        `}
        aria-label="Achtergrond aanpassen"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Palette className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed bottom-40 right-4 md:bottom-20 md:right-6 z-50 w-72 animate-scale-in">
            <div className="glass-card rounded-2xl p-4 border border-white/10 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-400" />
                  Achtergrond
                </h3>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                  title="Reset naar standaard"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Color Presets */}
              <div className="mb-4">
                <label className="text-xs text-white/50 mb-2 block">Kleurthema</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePreset(preset)}
                      className={`
                        w-8 h-8 rounded-full border-2 transition-all
                        ${settings.color1 === preset.color1
                          ? 'border-white scale-110'
                          : 'border-transparent hover:border-white/50'
                        }
                      `}
                      style={{
                        background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`,
                      }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                {/* Speed */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">Snelheid</span>
                    <span className="text-white/70">{settings.timeSpeed.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.timeSpeed}
                    onChange={(e) => handleChange('timeSpeed', parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                {/* Warp Strength */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">Golven</span>
                    <span className="text-white/70">{settings.warpStrength.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={settings.warpStrength}
                    onChange={(e) => handleChange('warpStrength', parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                {/* Warp Speed */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">Golf snelheid</span>
                    <span className="text-white/70">{settings.warpSpeed.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={settings.warpSpeed}
                    onChange={(e) => handleChange('warpSpeed', parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                {/* Grain */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">Korrel</span>
                    <span className="text-white/70">{settings.grainAmount.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.3"
                    step="0.01"
                    value={settings.grainAmount}
                    onChange={(e) => handleChange('grainAmount', parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">Contrast</span>
                    <span className="text-white/70">{settings.contrast.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.contrast}
                    onChange={(e) => handleChange('contrast', parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                {/* Zoom */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">Zoom</span>
                    <span className="text-white/70">{settings.zoom.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.zoom}
                    onChange={(e) => handleChange('zoom', parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export { DEFAULT_SETTINGS };
export type { BackgroundSettings };
