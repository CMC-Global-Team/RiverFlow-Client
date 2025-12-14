"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TutorialContextValue, TutorialAccessMode, TutorialStep } from '@/types/tutorial.types';
import { getTutorialSteps } from '@/lib/tutorial-steps';

const defaultState: TutorialContextValue = {
    isActive: false,
    currentStepIndex: 0,
    accessMode: null,
    steps: [],
    startTutorial: () => { },
    endTutorial: () => { },
    nextStep: () => { },
    prevStep: () => { },
    goToStep: () => { },
};

const TutorialContext = createContext<TutorialContextValue>(defaultState);

export function TutorialProvider({ children }: { children: ReactNode }) {
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [accessMode, setAccessMode] = useState<TutorialAccessMode | null>(null);
    const [steps, setSteps] = useState<TutorialStep[]>([]);

    const startTutorial = useCallback((mode: TutorialAccessMode) => {
        const tutorialSteps = getTutorialSteps(mode);
        setAccessMode(mode);
        setSteps(tutorialSteps);
        setCurrentStepIndex(0);
        setIsActive(true);
    }, []);

    const endTutorial = useCallback(() => {
        setIsActive(false);
        setCurrentStepIndex(0);
        setAccessMode(null);
        setSteps([]);
    }, []);

    const nextStep = useCallback(() => {
        setCurrentStepIndex((prev) => {
            const next = prev + 1;
            if (next >= steps.length) {
                // End tutorial when reaching the end
                setIsActive(false);
                setAccessMode(null);
                setSteps([]);
                return 0;
            }
            return next;
        });
    }, [steps.length]);

    const prevStep = useCallback(() => {
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }, []);

    const goToStep = useCallback((index: number) => {
        if (index >= 0 && index < steps.length) {
            setCurrentStepIndex(index);
        }
    }, [steps.length]);

    return (
        <TutorialContext.Provider
            value={{
                isActive,
                currentStepIndex,
                accessMode,
                steps,
                startTutorial,
                endTutorial,
                nextStep,
                prevStep,
                goToStep,
            }}
        >
            {children}
        </TutorialContext.Provider>
    );
}

export function useTutorial() {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error('useTutorial must be used within a TutorialProvider');
    }
    return context;
}
