/**
 * ExportModal — Video export configuration and progress dialog.
 * Resolution, FPS, format selection, and export progress bar.
 *
 * @module @animatica/editor/modals/ExportModal
 */
import React, { useState, useCallback } from 'react';
import { useToast } from '../components/ToastContext';
import { useTranslation } from '../i18n/useTranslation';

interface ExportModalProps {
    onClose: () => void;
}

type Resolution = '720p' | '1080p' | '4K';
type FPS = 24 | 30 | 60;
type Format = 'mp4' | 'webm';

const RESOLUTION_MAP: Record<Resolution, { width: number; height: number }> = {
    '720p': { width: 1280, height: 720 },
    '1080p': { width: 1920, height: 1080 },
    '4K': { width: 3840, height: 2160 },
};

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [resolution, setResolution] = useState<Resolution>('1080p');
    const [fps, setFps] = useState<FPS>(30);
    const [format, setFormat] = useState<Format>('mp4');
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const { showToast } = useToast();

    const handleExport = useCallback(() => {
        setIsExporting(true);
        setProgress(0);
        showToast(t('export.starting', { resolution, fps }), 'info');

        // Simulate export progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsExporting(false);
                    showToast(t('export.success'), 'success');
                    onClose(); // Close modal on success
                    return 100;
                }
                return prev + 2;
            });
        }, 100);
    }, [resolution, fps, showToast, onClose, t]);

    const handleCancel = useCallback(() => {
        setIsExporting(false);
        setProgress(0);
        showToast(t('export.cancelled'), 'info');
    }, [showToast, t]);

    const res = RESOLUTION_MAP[resolution];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal export-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">🎬 {t('export.title')}</h2>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>
                <div className="retro-stripe retro-stripe--thin" />

                <div className="export-modal__body">
                    {/* Resolution */}
                    <div className="export-field">
                        <label className="export-field__label">{t('export.resolution')}</label>
                        <div className="export-field__options">
                            {(['720p', '1080p', '4K'] as Resolution[]).map((r) => (
                                <button
                                    key={r}
                                    className={`export-option ${resolution === r ? 'export-option--active' : ''}`}
                                    onClick={() => setResolution(r)}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        <span className="export-field__detail">{res.width} × {res.height}</span>
                    </div>

                    {/* FPS */}
                    <div className="export-field">
                        <label className="export-field__label">{t('export.frameRate')}</label>
                        <div className="export-field__options">
                            {([24, 30, 60] as FPS[]).map((f) => (
                                <button
                                    key={f}
                                    className={`export-option ${fps === f ? 'export-option--active' : ''}`}
                                    onClick={() => setFps(f)}
                                >
                                    {t('export.fpsSuffix', { count: f })}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Format */}
                    <div className="export-field">
                        <label className="export-field__label">{t('export.format')}</label>
                        <div className="export-field__options">
                            {(['mp4', 'webm'] as Format[]).map((f) => (
                                <button
                                    key={f}
                                    className={`export-option ${format === f ? 'export-option--active' : ''}`}
                                    onClick={() => setFormat(f)}
                                >
                                    .{f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {isExporting && (
                        <div className="export-progress">
                            <div className="export-progress__bar">
                                <div
                                    className="export-progress__fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="export-progress__text">{progress}%</span>
                        </div>
                    )}
                </div>

                <div className="modal__footer">
                    {isExporting ? (
                        <button className="editor-btn editor-btn--ghost" onClick={handleCancel}>
                            {t('export.cancel')}
                        </button>
                    ) : (
                        <>
                            <button className="editor-btn editor-btn--ghost" onClick={onClose}>
                                {t('export.close')}
                            </button>
                            <button className="editor-btn editor-btn--primary" onClick={handleExport}>
                                {t('export.startExport', { format: format.toUpperCase() })}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
