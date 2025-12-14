// Type declarations for react-tour-guide-cct-new
declare module 'react-tour-guide-cct-new' {
    import { ReactNode } from 'react';

    export interface TourStep {
        target: string;
        content: ReactNode;
        position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
        spotlightPadding?: number;
        disableInteraction?: boolean;
    }

    export interface TourStepPopupProps {
        steps: TourStep[];
        isOpen: boolean;
        onClose: () => void;
        currentStep?: number;
        onStepChange?: (step: number) => void;
        showButtons?: boolean;
        showProgress?: boolean;
        className?: string;
    }

    export function TourStepPopup(props: TourStepPopupProps): JSX.Element;
}
