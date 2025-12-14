import { TutorialStep, TutorialAccessMode } from '@/types/tutorial.types';

/**
 * Tutorial step definitions for each access mode
 * Steps are configured with CSS selectors targeting data-tutorial-* attributes on toolbar elements
 */

// Common steps for all users
const commonSteps: TutorialStep[] = [
    {
        id: 'welcome',
        target: '[data-tutorial="toolbar"]',
        title: 'tutorial.welcome.title',
        description: 'tutorial.welcome.description',
        position: 'bottom',
        spotlightPadding: 8,
    },
    {
        id: 'zoom-controls',
        target: '[data-tutorial="zoom-controls"]',
        title: 'tutorial.zoomControls.title',
        description: 'tutorial.zoomControls.description',
        position: 'bottom',
    },
    {
        id: 'download',
        target: '[data-tutorial="download"]',
        title: 'tutorial.download.title',
        description: 'tutorial.download.description',
        position: 'bottom',
    },
    {
        id: 'chat',
        target: '[data-tutorial="chat"]',
        title: 'tutorial.chat.title',
        description: 'tutorial.chat.description',
        position: 'bottom',
    },
    {
        id: 'theme',
        target: '[data-tutorial="theme"]',
        title: 'tutorial.theme.title',
        description: 'tutorial.theme.description',
        position: 'bottom',
    },
    {
        id: 'share-button',
        target: '[data-tutorial="share"]',
        title: 'tutorial.share.title',
        description: 'tutorial.share.description',
        position: 'bottom',
    },
];

// Additional steps for viewers (explaining limitations)
const viewerOnlySteps: TutorialStep[] = [
    {
        id: 'viewer-notice',
        target: '[data-tutorial="permission-label"]',
        title: 'tutorial.viewerNotice.title',
        description: 'tutorial.viewerNotice.description',
        position: 'bottom',
    },
];

// Additional steps for editors (editing features)
const editorSteps: TutorialStep[] = [
    {
        id: 'add-node',
        target: '[data-tutorial="add-node"]',
        title: 'tutorial.addNode.title',
        description: 'tutorial.addNode.description',
        position: 'bottom',
    },
    {
        id: 'add-sibling',
        target: '[data-tutorial="add-sibling"]',
        title: 'tutorial.addSibling.title',
        description: 'tutorial.addSibling.description',
        position: 'bottom',
    },
    {
        id: 'delete',
        target: '[data-tutorial="delete"]',
        title: 'tutorial.delete.title',
        description: 'tutorial.delete.description',
        position: 'bottom',
    },
    {
        id: 'undo-redo',
        target: '[data-tutorial="undo-redo"]',
        title: 'tutorial.undoRedo.title',
        description: 'tutorial.undoRedo.description',
        position: 'bottom',
    },
    {
        id: 'history',
        target: '[data-tutorial="history"]',
        title: 'tutorial.history.title',
        description: 'tutorial.history.description',
        position: 'bottom',
    },
    {
        id: 'auto-save',
        target: '[data-tutorial="auto-save"]',
        title: 'tutorial.autoSave.title',
        description: 'tutorial.autoSave.description',
        position: 'bottom',
    },
];

// Additional steps for owners (ownership features)
const ownerSteps: TutorialStep[] = [
    {
        id: 'ai-composer',
        target: '[data-tutorial="ai"]',
        title: 'tutorial.aiComposer.title',
        description: 'tutorial.aiComposer.description',
        position: 'bottom',
    },
    {
        id: 'embed',
        target: '[data-tutorial="embed"]',
        title: 'tutorial.embed.title',
        description: 'tutorial.embed.description',
        position: 'bottom',
    },
];

// Final step for completion
const completionStep: TutorialStep = {
    id: 'completion',
    target: '[data-tutorial="toolbar"]',
    title: 'tutorial.completion.title',
    description: 'tutorial.completion.description',
    position: 'bottom',
};

/**
 * Get tutorial steps for a specific access mode
 */
export function getTutorialSteps(mode: TutorialAccessMode): TutorialStep[] {
    switch (mode) {
        case 'viewer':
        case 'public-view':
            return [...commonSteps, ...viewerOnlySteps, completionStep];

        case 'editor':
        case 'public-edit':
            return [...commonSteps, ...editorSteps, completionStep];

        case 'owner':
            return [...commonSteps, ...editorSteps, ...ownerSteps, completionStep];

        default:
            return [...commonSteps, completionStep];
    }
}

/**
 * Map user role from editor context to tutorial access mode
 */
export function mapUserRoleToAccessMode(
    userRole: 'owner' | 'editor' | 'viewer' | null,
    isPublicAccess: boolean = false
): TutorialAccessMode {
    if (!userRole) return 'public-view';

    if (isPublicAccess) {
        return userRole === 'editor' ? 'public-edit' : 'public-view';
    }

    return userRole;
}
