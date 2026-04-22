'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { BackgroundControls, DEFAULT_SETTINGS, type BackgroundSettings } from './BackgroundControls';

// Dynamic import to avoid SSR issues with WebGL
const Grainient = dynamic(
  () => import('./Grainient').then((mod) => mod.Grainient),
  { ssr: false }
);

export function AnimatedBackground() {
  const [settings, setSettings] = useState<BackgroundSettings>(DEFAULT_SETTINGS);

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <Grainient
          color1={settings.color1}
          color2={settings.color2}
          color3={settings.color3}
          timeSpeed={settings.timeSpeed}
          colorBalance={0.2}
          warpStrength={settings.warpStrength}
          warpFrequency={3.0}
          warpSpeed={settings.warpSpeed}
          warpAmplitude={80.0}
          blendAngle={45.0}
          blendSoftness={0.15}
          rotationAmount={200.0}
          noiseScale={1.5}
          grainAmount={settings.grainAmount}
          grainScale={3.0}
          grainAnimated={false}
          contrast={settings.contrast}
          gamma={1.1}
          saturation={settings.saturation}
          centerX={0.0}
          centerY={0.0}
          zoom={settings.zoom}
        />
      </div>

      {/* Controls */}
      <BackgroundControls
        settings={settings}
        onSettingsChange={setSettings}
      />
    </>
  );
}
