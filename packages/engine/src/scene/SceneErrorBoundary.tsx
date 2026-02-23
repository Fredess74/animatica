/**
 * Scene Error Boundary — R3F-compatible error boundary.
 * Catches errors from 3D objects and renders a fallback wireframe box.
 *
 * @module @animatica/engine/scene/SceneErrorBoundary
 */
import React, { Component, ReactNode } from 'react';
import { logError } from '../utils/errorHandler';

interface Props {
    children: ReactNode;
    actorId?: string;
}

interface State {
    hasError: boolean;
}

export class SceneErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        logError(error, {
            component: 'SceneErrorBoundary',
            actorId: this.props.actorId,
            reactInfo: errorInfo.componentStack,
        });
    }

    render() {
        if (this.state.hasError) {
            // Render a red wireframe box as fallback
            return (
                <group>
                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshBasicMaterial color="red" wireframe />
                    </mesh>
                </group>
            );
        }

        return this.props.children;
    }
}
