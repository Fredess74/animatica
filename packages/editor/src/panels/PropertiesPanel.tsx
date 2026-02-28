/**
 * PropertiesPanel — Shows and edits properties of the selected actor.
 * Displays transform (position, rotation, scale) and type-specific properties.
 *
 * @module @Animatica/editor/panels/PropertiesPanel
 */
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useSceneStore, Actor, PrimitiveActor, LightActor, CameraActor, CharacterActor } from '@Animatica/engine';

interface PropertiesPanelProps {
    selectedActorId: string | null;
}

// Local math helpers to avoid three.js dependency in UI component
const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

const radToDeg = (rad: number) => rad * RAD2DEG;
const degToRad = (deg: number) => deg * DEG2RAD;

// Helper hook for debounced updates
function useDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delay: number) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
}

// Helper hook to manage local state and debounced updates
function useDebouncedInput<T>(value: T, onChange: (val: T) => void, delay = 300) {
    const [localValue, setLocalValue] = useState<T>(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const debouncedOnChange = useDebouncedCallback(onChange, delay);

    const handleChange = useCallback((newValue: T) => {
        setLocalValue(newValue);
        debouncedOnChange(newValue);
    }, [debouncedOnChange]);

    return [localValue, handleChange] as const;
}

const NumberInput: React.FC<{
    label?: string;
    value: number;
    onChange: (v: number) => void;
    step?: number;
    min?: number;
    max?: number;
    className?: string;
}> = ({ label, value, onChange, step = 0.1, min, max, className }) => {
    const [localValue, setLocalValue] = useState<string>(value.toString());

    useEffect(() => {
        // Only update if value matches parsed local value (handles 1. vs 1)
        if (parseFloat(localValue) !== value && !isNaN(parseFloat(localValue))) {
            setLocalValue(value.toString());
        } else if (isNaN(parseFloat(localValue)) && !isNaN(value)) {
            // Recover from invalid state if prop updates
             setLocalValue(value.toString());
        }
    }, [value]);

    const debouncedOnChange = useDebouncedCallback(onChange, 300);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setLocalValue(newVal);
        const num = parseFloat(newVal);
        if (!isNaN(num)) {
            debouncedOnChange(num);
        }
    };

    return (
        <div className={className || "prop-field"}>
            {label && <label className="prop-field__label">{label}</label>}
            <input
                type="number"
                className="prop-field__input"
                value={localValue}
                onChange={handleChange}
                step={step}
                min={min}
                max={max}
            />
        </div>
    );
};


interface Vector3InputProps {
    label: string;
    value: [number, number, number];
    onChange: (v: [number, number, number]) => void;
}

const Vector3Input: React.FC<Vector3InputProps> = ({ label, value, onChange }) => {
    const [localValue, setLocalValue] = useState<[string, string, string]>([
        value[0].toString(), value[1].toString(), value[2].toString()
    ]);

    useEffect(() => {
        // Sync props to local state if they differ significantly
        setLocalValue(prev => {
            const next = [...prev] as [string, string, string];
            let changed = false;
            for (let i = 0; i < 3; i++) {
                if (parseFloat(prev[i]) !== value[i]) {
                    next[i] = value[i].toString();
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [value]);

    const debouncedOnChange = useDebouncedCallback(onChange, 300);

    const handleChange = (index: number, strVal: string) => {
        setLocalValue(prev => {
            const next = [...prev] as [string, string, string];
            next[index] = strVal;

            const num = parseFloat(strVal);
            if (!isNaN(num)) {
                 // Construct vector from current state + new val
                 const vec = next.map(v => parseFloat(v) || 0) as [number, number, number];
                 debouncedOnChange(vec);
            }
            return next;
        });
    };

    return (
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
                            value={localValue[i]}
                            onChange={(e) => handleChange(i, e.target.value)}
                            step={0.1}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const ColorInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({
    label,
    value,
    onChange,
}) => {
    const [localValue, handleChange] = useDebouncedInput(value, onChange, 100);

    return (
        <div className="prop-field">
            <label className="prop-field__label">{label}</label>
            <div className="prop-field__color">
                <input type="color" value={localValue} onChange={(e) => handleChange(e.target.value)} />
                <span className="prop-field__color-hex">{localValue}</span>
            </div>
        </div>
    );
};

const SliderInput: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
}> = ({ label, value, min, max, step, onChange }) => {
    const [localValue, handleChange] = useDebouncedInput(value, onChange, 50);

    return (
        <div className="prop-field">
            <label className="prop-field__label">
                {label}
                <span className="prop-field__value">{localValue.toFixed(2)}</span>
            </label>
            <input
                type="range"
                className="prop-field__slider"
                value={localValue}
                min={min}
                max={max}
                step={step}
                onChange={(e) => handleChange(parseFloat(e.target.value))}
            />
        </div>
    );
};

const TextInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({
    label,
    value,
    onChange,
}) => {
    const [localValue, handleChange] = useDebouncedInput(value, onChange, 300);
    return (
        <div className="prop-field">
            <label className="prop-field__label">{label}</label>
            <input
                type="text"
                className="prop-field__input prop-field__input--text"
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
            />
        </div>
    );
};

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedActorId }) => {
    const actor = useSceneStore((state) => state.actors.find((a) => a.id === selectedActorId));

    const handleUpdate = useCallback((updates: Partial<Actor>) => {
        if (selectedActorId) {
            useSceneStore.getState().updateActor(selectedActorId, updates);
        }
    }, [selectedActorId]);

    if (!selectedActorId || !actor) {
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

    // Convert rotation to degrees for display
    const rotationDeg = [
        radToDeg(actor.transform.rotation[0]),
        radToDeg(actor.transform.rotation[1]),
        radToDeg(actor.transform.rotation[2])
    ] as [number, number, number];

    return (
        <div className="panel properties-panel">
            <h3 className="panel__title">Properties</h3>
            <div className="retro-stripe retro-stripe--thin" />

            <div className="prop-section">
                <h4 className="prop-section__title">General</h4>
                <TextInput
                    label="Name"
                    value={actor.name}
                    onChange={(name) => handleUpdate({ name })}
                />
            </div>

            <div className="prop-section">
                <h4 className="prop-section__title">Transform</h4>
                <Vector3Input
                    label="Position"
                    value={actor.transform.position}
                    onChange={(position) => handleUpdate({ transform: { ...actor.transform, position } })}
                />
                <Vector3Input
                    label="Rotation"
                    value={rotationDeg}
                    onChange={(deg) => handleUpdate({
                        transform: {
                            ...actor.transform,
                            rotation: [
                                degToRad(deg[0]),
                                degToRad(deg[1]),
                                degToRad(deg[2])
                            ]
                        }
                    })}
                />
                <Vector3Input
                    label="Scale"
                    value={actor.transform.scale}
                    onChange={(scale) => handleUpdate({ transform: { ...actor.transform, scale } })}
                />
            </div>

            {actor.type === 'primitive' && (
                <div className="prop-section">
                    <h4 className="prop-section__title">Material</h4>
                    <div className="prop-field">
                        <label className="prop-field__label">Shape</label>
                        <select
                            className="prop-field__select"
                            value={(actor as PrimitiveActor).properties.shape}
                            onChange={(e) => handleUpdate({
                                properties: { ...(actor as PrimitiveActor).properties, shape: e.target.value as any }
                            })}
                        >
                            <option value="box">Box</option>
                            <option value="sphere">Sphere</option>
                            <option value="cylinder">Cylinder</option>
                            <option value="plane">Plane</option>
                            <option value="cone">Cone</option>
                            <option value="torus">Torus</option>
                            <option value="capsule">Capsule</option>
                        </select>
                    </div>
                    <ColorInput
                        label="Color"
                        value={(actor as PrimitiveActor).properties.color}
                        onChange={(color) => handleUpdate({
                            properties: { ...(actor as PrimitiveActor).properties, color }
                        })}
                    />
                    <SliderInput
                        label="Roughness"
                        value={(actor as PrimitiveActor).properties.roughness}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(roughness) => handleUpdate({
                            properties: { ...(actor as PrimitiveActor).properties, roughness }
                        })}
                    />
                    <SliderInput
                        label="Metalness"
                        value={(actor as PrimitiveActor).properties.metalness}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(metalness) => handleUpdate({
                            properties: { ...(actor as PrimitiveActor).properties, metalness }
                        })}
                    />
                    <SliderInput
                        label="Opacity"
                        value={(actor as PrimitiveActor).properties.opacity}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(opacity) => handleUpdate({
                            properties: { ...(actor as PrimitiveActor).properties, opacity }
                        })}
                    />
                    <div className="prop-field prop-field--checkbox">
                        <label className="prop-field__label">
                            <input
                                type="checkbox"
                                checked={(actor as PrimitiveActor).properties.wireframe}
                                onChange={(e) => handleUpdate({
                                    properties: { ...(actor as PrimitiveActor).properties, wireframe: e.target.checked }
                                })}
                            />
                            Wireframe
                        </label>
                    </div>
                </div>
            )}

            {actor.type === 'light' && (
                <div className="prop-section">
                    <h4 className="prop-section__title">Light Settings</h4>
                    <div className="prop-field">
                        <label className="prop-field__label">Type</label>
                        <select
                            className="prop-field__select"
                            value={(actor as LightActor).properties.lightType}
                            onChange={(e) => handleUpdate({
                                properties: { ...(actor as LightActor).properties, lightType: e.target.value as any }
                            })}
                        >
                            <option value="point">Point</option>
                            <option value="spot">Spot</option>
                            <option value="directional">Directional</option>
                        </select>
                    </div>
                    <ColorInput
                        label="Color"
                        value={(actor as LightActor).properties.color}
                        onChange={(color) => handleUpdate({
                            properties: { ...(actor as LightActor).properties, color }
                        })}
                    />
                    <SliderInput
                        label="Intensity"
                        value={(actor as LightActor).properties.intensity}
                        min={0}
                        max={10}
                        step={0.1}
                        onChange={(intensity) => handleUpdate({
                            properties: { ...(actor as LightActor).properties, intensity }
                        })}
                    />
                    <div className="prop-field prop-field--checkbox">
                        <label className="prop-field__label">
                            <input
                                type="checkbox"
                                checked={(actor as LightActor).properties.castShadow}
                                onChange={(e) => handleUpdate({
                                    properties: { ...(actor as LightActor).properties, castShadow: e.target.checked }
                                })}
                            />
                            Cast Shadow
                        </label>
                    </div>
                </div>
            )}

            {actor.type === 'camera' && (
                <div className="prop-section">
                    <h4 className="prop-section__title">Camera Settings</h4>
                    <SliderInput
                        label="Field of View"
                        value={(actor as CameraActor).properties.fov}
                        min={10}
                        max={120}
                        step={1}
                        onChange={(fov) => handleUpdate({
                            properties: { ...(actor as CameraActor).properties, fov }
                        })}
                    />
                    <NumberInput
                        label="Near Plane"
                        value={(actor as CameraActor).properties.near}
                        onChange={(near) => handleUpdate({
                            properties: { ...(actor as CameraActor).properties, near }
                        })}
                        step={0.1}
                        min={0.1}
                    />
                    <NumberInput
                        label="Far Plane"
                        value={(actor as CameraActor).properties.far}
                        onChange={(far) => handleUpdate({
                            properties: { ...(actor as CameraActor).properties, far }
                        })}
                        step={10}
                        min={1}
                    />
                </div>
            )}

            {actor.type === 'character' && (
                <div className="prop-section">
                    <h4 className="prop-section__title">Character Settings</h4>
                    <div className="prop-field">
                        <label className="prop-field__label">Animation</label>
                        <select
                            className="prop-field__select"
                            value={(actor as CharacterActor).animation}
                            onChange={(e) => handleUpdate({ animation: e.target.value as any })}
                        >
                            <option value="idle">Idle</option>
                            <option value="walk">Walk</option>
                            <option value="run">Run</option>
                            <option value="wave">Wave</option>
                            <option value="talk">Talk</option>
                            <option value="dance">Dance</option>
                            <option value="sit">Sit</option>
                            <option value="jump">Jump</option>
                        </select>
                    </div>
                    <SliderInput
                        label="Animation Speed"
                        value={(actor as CharacterActor).animationSpeed || 1}
                        min={0}
                        max={5}
                        step={0.1}
                        onChange={(speed) => handleUpdate({ animationSpeed: speed })}
                    />
                </div>
            )}
        </div>
    );
};
