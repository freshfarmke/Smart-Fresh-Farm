"use client";
import React from 'react';
import ProductionOperationsSettings from '@/components/production/ProductionOperationsSettings';

export default function ProductionSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Production Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Production module preferences and configurations</p>
      </div>

      <ProductionOperationsSettings />
    </div>
  );
}
