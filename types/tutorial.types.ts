/**
 * Tutorial types for react-tour-guide-cct-new integration
 */

// User access modes for the tutorial
export type TutorialAccessMode =
    | 'owner'        // Mindmap creator with full permissions
    | 'editor'       // Collaborator with EDITOR role
    | 'viewer'       // Collaborator with VIEWER role
    | 'public-edit'  // Public link with edit access
    | 'public-view'; // Public link with view access

// Tutorial step definition
export interface TutorialStep {
    id: string;
    target: string;           // CSS selector for the element to highlight
    title: string;            // Step title (translation key)
    description: string;      // Step description (translation key)
    position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    disableInteraction?: boolean;
    spotlightPadding?: number;
}

// Tutorial configuration for a specific mode
export interface TutorialConfig {
    mode: TutorialAccessMode;
    steps: TutorialStep[];
}

// Tutorial context state
export interface TutorialState {
    isActive: boolean;
    currentStepIndex: number;
    accessMode: TutorialAccessMode | null;
    steps: TutorialStep[];
}

// Tutorial context actions
export interface TutorialContextValue extends TutorialState {
    startTutorial: (mode: TutorialAccessMode) => void;
    endTutorial: () => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (index: number) => void;
}
