"use client"

import { useEffect, useState } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function TutorialOverlay() {
    const { t } = useTranslation('tutorial');
    const {
        isActive,
        currentStepIndex,
        steps,
        nextStep,
        prevStep,
        endTutorial,
    } = useTutorial();

    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const currentStep = steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    // Update target element when step changes
    useEffect(() => {
        if (!isActive || !currentStep) {
            setTargetElement(null);
            return;
        }

        const element = document.querySelector(currentStep.target) as HTMLElement;
        setTargetElement(element);

        if (element) {
            const rect = element.getBoundingClientRect();
            const pos = currentStep.position || 'bottom';

            let top = 0;
            let left = 0;

            switch (pos) {
                case 'bottom':
                    top = rect.bottom + 12;
                    left = rect.left + rect.width / 2;
                    break;
                case 'top':
                    top = rect.top - 12;
                    left = rect.left + rect.width / 2;
                    break;
                case 'left':
                    top = rect.top + rect.height / 2;
                    left = rect.left - 12;
                    break;
                case 'right':
                    top = rect.top + rect.height / 2;
                    left = rect.right + 12;
                    break;
                default:
                    top = rect.bottom + 12;
                    left = rect.left + rect.width / 2;
            }

            setPosition({ top, left });

            // Scroll element into view if needed
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isActive, currentStep, currentStepIndex]);

    if (!isActive || !currentStep) {
        return null;
    }

    // Extract the key path from the step (e.g., 'tutorial.welcome.title' -> 'welcome.title')
    const getTitleKey = () => {
        const key = currentStep.title.replace('tutorial.', '');
        return t(key, { defaultValue: currentStep.title });
    };

    const getDescriptionKey = () => {
        const key = currentStep.description.replace('tutorial.', '');
        return t(key, { defaultValue: currentStep.description });
    };

    const title = getTitleKey();
    const description = getDescriptionKey();

    return (
        <>
            {/* Backdrop overlay - lighter for better visibility */}
            <div
                className="fixed inset-0 z-[9998] bg-black/30 transition-opacity"
                onClick={endTutorial}
            />

            {/* Spotlight on target element */}
            {targetElement && (
                <div
                    className="fixed z-[9999] ring-4 ring-primary ring-offset-4 ring-offset-transparent rounded-lg pointer-events-none transition-all duration-300"
                    style={{
                        top: targetElement.getBoundingClientRect().top - (currentStep.spotlightPadding || 4),
                        left: targetElement.getBoundingClientRect().left - (currentStep.spotlightPadding || 4),
                        width: targetElement.getBoundingClientRect().width + ((currentStep.spotlightPadding || 4) * 2),
                        height: targetElement.getBoundingClientRect().height + ((currentStep.spotlightPadding || 4) * 2),
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
                    }}
                />
            )}

            {/* Tutorial popup */}
            <div
                className="fixed z-[10000] w-80 bg-card border border-border rounded-xl shadow-xl p-4 transform -translate-x-1/2 animate-in fade-in-0 zoom-in-95 duration-200"
                style={{
                    top: position.top,
                    left: position.left,
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">
                        {currentStepIndex + 1} / {steps.length}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={endTutorial}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-foreground mb-1">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                        disabled={isFirstStep}
                        className="gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {t('back', 'Back')}
                    </Button>

                    <Button
                        size="sm"
                        onClick={nextStep}
                        className="gap-1"
                    >
                        {isLastStep ? t('finish', 'Finish') : t('next', 'Next')}
                        {!isLastStep && <ChevronRight className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </>
    );
}
