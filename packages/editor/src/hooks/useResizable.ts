import { useState, useCallback, useEffect, useRef } from 'react';

type Direction = 'horizontal' | 'vertical';

interface UseResizableOptions {
    initialSize: number;
    minSize?: number;
    maxSize?: number;
    direction?: Direction;
    reverse?: boolean;
}

/**
 * Hook to manage resizable panel state.
 * Handles mouse events for smooth dragging.
 */
export function useResizable({
    initialSize,
    minSize = 50,
    maxSize = 800,
    direction = 'horizontal',
    reverse = false,
}: UseResizableOptions) {
    const [size, setSize] = useState(initialSize);
    const [isResizing, setIsResizing] = useState(false);
    const startPosRef = useRef<number>(0);
    const startSizeRef = useRef<number>(0);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault(); // Prevent text selection
        setIsResizing(true);
        startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
        startSizeRef.current = size;
    }, [direction, size]);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
            const delta = currentPos - startPosRef.current;

            let newSize = startSizeRef.current + (reverse ? -delta : delta);
            newSize = Math.max(minSize, Math.min(newSize, maxSize));

            setSize(newSize);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = '';
        };

        // Set global cursor during resize
        document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
        };
    }, [isResizing, direction, reverse, minSize, maxSize]);

    return { size, setSize, startResizing, isResizing };
}
