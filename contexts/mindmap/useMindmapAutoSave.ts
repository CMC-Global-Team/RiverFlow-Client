"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { SaveStatus, AutoSaveOptions, UseMindmapAutoSaveResult } from './types'

export function useMindmapAutoSave(
    onSave: () => Promise<void>,
    {
        defaultEnabled = true,
        debounceMs = 1500,
        statusResetMs = 2000,
        setIsSaving,
        onError,
    }: AutoSaveOptions = {}
): UseMindmapAutoSaveResult {
    const [autoSaveEnabled, setAutoSaveEnabledState] = useState(defaultEnabled)
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
    const statusTimerRef = useRef<NodeJS.Timeout | null>(null)
    const isMountedRef = useRef(true)

    useEffect(() => {
        return () => {
            isMountedRef.current = false
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current)
                saveTimerRef.current = null
            }
            if (statusTimerRef.current) {
                clearTimeout(statusTimerRef.current)
                statusTimerRef.current = null
            }
        }
    }, [])

    const clearSaveTimer = useCallback(() => {
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current)
            saveTimerRef.current = null
        }
    }, [])

    const clearStatusTimer = useCallback(() => {
        if (statusTimerRef.current) {
            clearTimeout(statusTimerRef.current)
            statusTimerRef.current = null
        }
    }, [])

    const scheduleStatusReset = useCallback(() => {
        clearStatusTimer()
        statusTimerRef.current = setTimeout(() => {
            if (!isMountedRef.current) return
            setSaveStatus('idle')
        }, statusResetMs)
    }, [clearStatusTimer, statusResetMs])

    const runSave = useCallback(async () => {
        clearSaveTimer()
        clearStatusTimer()
        setIsSaving?.(true)
        setSaveStatus('saving')
        try {
            await onSave()
            if (!isMountedRef.current) return
            setSaveStatus('saved')
            scheduleStatusReset()
        } catch (error) {
            if (isMountedRef.current) {
                setSaveStatus('error')
            }
            onError?.(error)
            throw error
        } finally {
            setIsSaving?.(false)
        }
    }, [clearSaveTimer, clearStatusTimer, onSave, onError, scheduleStatusReset, setIsSaving])

    const scheduleAutoSave = useCallback(
        (debounceMsOverride?: number) => {
            if (!autoSaveEnabled) return
            clearSaveTimer()
            const delay = debounceMsOverride ?? debounceMs
            saveTimerRef.current = setTimeout(() => {
                runSave().catch(() => { })
            }, delay)
        },
        [autoSaveEnabled, clearSaveTimer, debounceMs, runSave]
    )

    const saveImmediately = useCallback(async () => {
        await runSave()
    }, [runSave])

    const cancelScheduledSave = useCallback(() => {
        clearSaveTimer()
    }, [clearSaveTimer])

    const markSynced = useCallback(
        (status: SaveStatus = 'saved') => {
            if (!isMountedRef.current) return
            clearStatusTimer()
            setSaveStatus(status)
            if (status === 'saved') {
                scheduleStatusReset()
            }
        },
        [clearStatusTimer, scheduleStatusReset]
    )

    const handleToggleAutoSave = useCallback(
        (enabled: boolean) => {
            setAutoSaveEnabledState(enabled)
            if (!enabled) {
                cancelScheduledSave()
                clearStatusTimer()
                setSaveStatus('idle')
            }
        },
        [cancelScheduledSave, clearStatusTimer]
    )

    // External setter for socket sync - only updates state, doesn't trigger side effects for cancel
    const setAutoSaveEnabledExternal = useCallback(
        (enabled: boolean) => {
            setAutoSaveEnabledState(enabled)
            if (!enabled) {
                cancelScheduledSave()
                clearStatusTimer()
                setSaveStatus('idle')
            }
        },
        [cancelScheduledSave, clearStatusTimer]
    )

    return {
        autoSaveEnabled,
        setAutoSaveEnabled: handleToggleAutoSave,
        setAutoSaveEnabledExternal,
        saveStatus,
        scheduleAutoSave,
        saveImmediately,
        cancelScheduledSave,
        markSynced,
    }
}
