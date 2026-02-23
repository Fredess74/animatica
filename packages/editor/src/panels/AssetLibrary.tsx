/**
 * AssetLibrary — Categorized panel for adding actors to the scene.
 * Categories: Primitives, Lights, Cameras, Characters, Effects.
 *
 * @module @animatica/editor/panels/AssetLibrary
 */
import React, { useState } from 'react'

interface AssetLibraryProps {
  onActorCreated?: (actorId: string) => void
}

interface AssetItem {
  name: string
  icon: string
  type: string
  defaults: Record<string, unknown>
}

const ASSET_CATEGORIES: Record<string, AssetItem[]> = {
  Primitives: [
    { name: 'Box', icon: '📦', type: 'primitive', defaults: { shape: 'box', color: '#22C55E' } },
    {
      name: 'Sphere',
      icon: '🔮',
      type: 'primitive',
      defaults: { shape: 'sphere', color: '#4ADE80' },
    },
    {
      name: 'Cylinder',
      icon: '🛢️',
      type: 'primitive',
      defaults: { shape: 'cylinder', color: '#86EFAC' },
    },
    { name: 'Cone', icon: '🔺', type: 'primitive', defaults: { shape: 'cone', color: '#16A34A' } },
    {
      name: 'Torus',
      icon: '🍩',
      type: 'primitive',
      defaults: { shape: 'torus', color: '#0D7A48' },
    },
    {
      name: 'Plane',
      icon: '⬜',
      type: 'primitive',
      defaults: { shape: 'plane', color: '#F5F5F0' },
    },
  ],
  Lights: [
    {
      name: 'Point Light',
      icon: '💡',
      type: 'light',
      defaults: { lightType: 'point', intensity: 1 },
    },
    {
      name: 'Spot Light',
      icon: '🔦',
      type: 'light',
      defaults: { lightType: 'spot', intensity: 1 },
    },
    {
      name: 'Directional',
      icon: '☀️',
      type: 'light',
      defaults: { lightType: 'directional', intensity: 0.5 },
    },
  ],
  Cameras: [
    { name: 'Camera', icon: '📷', type: 'camera', defaults: { fov: 75, near: 0.1, far: 1000 } },
  ],
  Characters: [{ name: 'Humanoid', icon: '🧑', type: 'character', defaults: { model: 'default' } }],
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ onActorCreated }) => {
  const [expandedCategory, setExpandedCategory] = useState<string>('Primitives')

  const handleAddActor = (_item: AssetItem) => {
    // In production, this would call useSceneStore.getState().addActor(...) with _item.defaults
    const id = `actor_${Date.now()}`
    onActorCreated?.(id)
  }

  return (
    <div className="panel asset-library">
      <h3 className="panel__title">Assets</h3>
      <div className="retro-stripe retro-stripe--thin" />

      {Object.entries(ASSET_CATEGORIES).map(([category, items]) => (
        <div key={category} className="asset-category">
          <button
            className={`asset-category__header ${expandedCategory === category ? 'asset-category__header--active' : ''}`}
            onClick={() => setExpandedCategory(expandedCategory === category ? '' : category)}
          >
            <span className="asset-category__arrow">
              {expandedCategory === category ? '▼' : '▶'}
            </span>
            <span>{category}</span>
            <span className="asset-category__count">{items.length}</span>
          </button>

          {expandedCategory === category && (
            <div className="asset-category__items">
              {items.map((item) => (
                <button
                  key={item.name}
                  className="asset-item"
                  onClick={() => handleAddActor(item)}
                  title={`Add ${item.name}`}
                >
                  <span className="asset-item__icon">{item.icon}</span>
                  <span className="asset-item__name">{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
