/**
 * PropertiesPanel — Shows and edits properties of the selected actor.
 * Displays transform (position, rotation, scale) and type-specific properties.
 *
 * @module @animatica/editor/panels/PropertiesPanel
 */
import React from 'react';

interface PropertiesPanelProps {
    selectedActorId: string | null;
}

interface Vector3InputProps {
    label: string;
    value: [number, number, number];
    onChange: (v: [number, number, number]) => void;
}

const Vector3Input: React.FC<Vector3InputProps> = ({ label, value, onChange }) => (
    <div className="prop-field">
        <label className="prop-field__label">{label}</label>
        <div className="prop-field__vector3">
            {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                <div key={axis} className="prop-field__axis">
                    <span className={`prop-field__axis-label prop-field__axis-label--${axis.toLowerCase()}`}>
                        {axis}
                    </span>
                    <input
                        type="number"
                        className="prop-field__input"
                        value={value[i]}
                        onChange={(e) => {
                            const newVal = [...value] as [number, number, number];
                            newVal[i] = parseFloat(e.target.value) || 0;
                            onChange(newVal);
                        }}
                        step={0.1}
                    />
                </div>
            ))}
        </div>
    </div>
);

const ColorInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({
    label,
    value,
    onChange,
}) => (
    <div className="prop-field">
        <label className="prop-field__label">{label}</label>
        <div className="prop-field__color">
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
            <span className="prop-field__color-hex">{value}</span>
        </div>
    </div>
);

const SliderInput: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
}> = ({ label, value, min, max, step, onChange }) => (
    <div className="prop-field">
        <label className="prop-field__label">
            {label}
            <span className="prop-field__value">{value.toFixed(2)}</span>
        </label>
        <input
            type="range"
            className="prop-field__slider"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(parseFloat(e.target.value))}
        />
    </div>
);

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedActorId }) => {
    if (!selectedActorId) {
        return (
            <div className="panel properties-panel">
                <h3 className="panel__title">Properties</h3>
                <div className="retro-stripe retro-stripe--thin" />
                <div className="panel__empty">
                    <span className="panel__empty-icon">🎯</span>
                    <p>Select an actor to edit its properties</p>
                </div>
            </div>
        );
    }

    // In production, this would read from useSceneStore
    return (
        <div className="panel properties-panel">
            <h3 className="panel__title">Properties</h3>
            <div className="retro-stripe retro-stripe--thin" />

            <div className="prop-section">
                <h4 className="prop-section__title">Transform</h4>
                <Vector3Input
                    label="Position"
                    value={[0, 0, 0]}
                    onChange={() => { }}
                />
                <Vector3Input
                    label="Rotation"
                    value={[0, 0, 0]}
                    onChange={() => { }}
                />
                <Vector3Input
                    label="Scale"
                    value={[1, 1, 1]}
                    onChange={() => { }}
                />
            </div>

            <div className="prop-section">
                <h4 className="prop-section__title">Material</h4>
                <ColorInput label="Color" value="#22C55E" onChange={() => { }} />
                <SliderInput label="Roughness" value={0.5} min={0} max={1} step={0.01} onChange={() => { }} />
                <SliderInput label="Metalness" value={0.0} min={0} max={1} step={0.01} onChange={() => { }} />
                <SliderInput label="Opacity" value={1.0} min={0} max={1} step={0.01} onChange={() => { }} />
            </div>
        </div>
    );
};
