/**
 * PropertiesPanel — Shows and edits properties of the selected actor.
 * Displays transform (position, rotation, scale) and type-specific properties.
 *
 * @module @animatica/editor/panels/PropertiesPanel
 */
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useSceneStore, Actor, PrimitiveActor, LightActor, CameraActor, CharacterActor } from '@Animatica/engine';
import { useTranslation } from '../i18n/useTranslation';

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
    const { t } = useTranslation();

    const handleUpdate = useCallback((updates: Partial<Actor>) => {
        if (selectedActorId) {
            useSceneStore.getState().updateActor(selectedActorId, updates);
        }
    }, [selectedActorId]);

    if (!selectedActorId || !actor) {
        return (
            <div className="panel properties-panel">
                <h3 className="panel__title">{t('properties.title')}</h3>
                <div className="retro-stripe retro-stripe--thin" />
                <div className="panel__empty">
                    <span className="panel__empty-icon">🎯</span>
                    <p>{t('properties.empty')}</p>
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
            <h3 className="panel__title">{t('properties.title')}</h3>
            <div className="retro-stripe retro-stripe--thin" />

            <div className="prop-section">
                <h4 className="prop-section__title">{t('properties.general')}</h4>
                <TextInput
                    label={t('properties.name')}
                    value={actor.name}
                    onChange={(name) => handleUpdate({ name })}
                />
            </div>

            <div className="prop-section">
                <h4 className="prop-section__title">{t('properties.transform')}</h4>
                <Vector3Input
                    label={t('properties.position')}
                    value={actor.transform.position}
                    onChange={(position) => handleUpdate({ transform: { ...actor.transform, position } })}
                />
                <Vector3Input
                    label={t('properties.rotation')}
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
                    label={t('properties.scale')}
                    value={actor.transform.scale}
                    onChange={(scale) => handleUpdate({ transform: { ...actor.transform, scale } })}
                />
            </div>

            {actor.type === 'primitive' && (
                <div className="prop-section">
                    <h4 className="prop-section__title">{t('properties.material')}</h4>
                    <div className="prop-field">
                        <label className="prop-field__label">{t('properties.shape')}</label>
                        <select
                            className="prop-field__select"
                            value={(actor as PrimitiveActor).properties.shape}
                            onChange={(e) => handleUpdate({
                                properties: { ...(actor as PrimitiveActor).properties, shape: e.target.value as any }
                            })}
                        >
                            <option value="box">{t('properties.shapes.box')}</option>
                            <option value="sphere">{t('properties.shapes.sphere')}</option>
                            <option value="cylinder">{t('properties.shapes.cylinder')}</option>
                            <option value="plane">{t('properties.shapes.plane')}</option>
                            <option value="cone">{t('properties.shapes.cone')}</option>
                            <option value="torus">{t('properties.shapes.torus')}</option>
                            <option value="capsule">{t('properties.shapes.capsule')}</option>
                        </select>
                    </div>
                    <ColorInput
                        label={t('properties.color')}
                        value={(actor as PrimitiveActor).properties.color}
                        onChange={(color) => handleUpdate({
                            properties: { ...(actor as PrimitiveActor).properties, color }
                        })}
                    />
                    <SliderInput
                        label={t('properties.roughness')}
                        value={(actor as PrimitiveActor).properties.roughness}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(roughness) => handleUpdate({
                            properties: { ...(actor as PrimitiveActor).properties, roughness }
                        })}
                    />
                    <SliderInput
                        label={t('properties.metalness')}
                        value={(actor as PrimitiveActor).properties.metalness}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(metalness) => handleUpdate({
                            properties: { ...(actor as PrimitiveActor).properties, metalness }
                        })}
                    />
                    <SliderInput
                        label={t('properties.opacity')}
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
                            {t('properties.wireframe')}
                        </label>
                    </div>
                </div>
            )}

            {actor.type === 'light' && (
                <div className="prop-section">
                    <h4 className="prop-section__title">{t('properties.light')}</h4>
                    <div className="prop-field">
                        <label className="prop-field__label">{t('properties.type')}</label>
                        <select
                            className="prop-field__select"
                            value={(actor as LightActor).properties.lightType}
                            onChange={(e) => handleUpdate({
                                properties: { ...(actor as LightActor).properties, lightType: e.target.value as any }
                            })}
                        >
                            <option value="point">{t('properties.lights.point')}</option>
                            <option value="spot">{t('properties.lights.spot')}</option>
                            <option value="directional">{t('properties.lights.directional')}</option>
                        </select>
                    </div>
                    <ColorInput
                        label={t('properties.color')}
                        value={(actor as LightActor).properties.color}
                        onChange={(color) => handleUpdate({
                            properties: { ...(actor as LightActor).properties, color }
                        })}
                    />
                    <SliderInput
                        label={t('properties.intensity')}
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
                            {t('properties.castShadow')}
                        </label>
                    </div>
                </div>
            )}

            {actor.type === 'camera' && (
                <div className="prop-section">
                    <h4 className="prop-section__title">{t('properties.camera')}</h4>
                    <SliderInput
                        label={t('properties.fov')}
                        value={(actor as CameraActor).properties.fov}
                        min={10}
                        max={120}
                        step={1}
                        onChange={(fov) => handleUpdate({
                            properties: { ...(actor as CameraActor).properties, fov }
                        })}
                    />
                    <NumberInput
                        label={t('properties.near')}
                        value={(actor as CameraActor).properties.near}
                        onChange={(near) => handleUpdate({
                            properties: { ...(actor as CameraActor).properties, near }
                        })}
                        step={0.1}
                        min={0.1}
                    />
                    <NumberInput
                        label={t('properties.far')}
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
                    <h4 className="prop-section__title">{t('properties.character')}</h4>
                    <div className="prop-field">
                        <label className="prop-field__label">{t('properties.animation')}</label>
                        <select
                            className="prop-field__select"
                            value={(actor as CharacterActor).animation}
                            onChange={(e) => handleUpdate({ animation: e.target.value as any })}
                        >
                            <option value="idle">{t('properties.animations.idle')}</option>
                            <option value="walk">{t('properties.animations.walk')}</option>
                            <option value="run">{t('properties.animations.run')}</option>
                            <option value="wave">{t('properties.animations.wave')}</option>
                            <option value="talk">{t('properties.animations.talk')}</option>
                            <option value="dance">{t('properties.animations.dance')}</option>
                            <option value="sit">{t('properties.animations.sit')}</option>
                            <option value="jump">{t('properties.animations.jump')}</option>
                        </select>
                    </div>
                    <SliderInput
                        label={t('properties.speed')}
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
