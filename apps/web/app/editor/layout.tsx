/**
 * /editor route layout — strips Navbar/Footer chrome for fullscreen editor.
 */
import React from 'react';

export const metadata = {
    title: 'Animatica Editor',
    description: 'Create, animate, and export 3D scenes',
};

export default function EditorRouteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {children}
        </div>
    );
}
