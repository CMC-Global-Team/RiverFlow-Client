'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import apiClient from '@/lib/apiClient';
import { Loader2 } from 'lucide-react';

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mindmapId, setMindmapId] = useState<string | null>(null);
  const [mindmapTitle, setMindmapTitle] = useState<string>('');
  const [accepting, setAccepting] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/auth?returnUrl=/accept-invitation?token=${token}`);
      return;
    }

    // Verify the invitation token
    if (token) {
      verifyInvitation(token);
    } else {
      setError('Invalid invitation link. Token is missing.');
      setLoading(false);
    }
  }, [token, isAuthenticated, router]);

  const verifyInvitation = async (invitationToken: string) => {
    try {
      setLoading(true);
      // Call API to verify the invitation and get mindmap details
      const response = await apiClient.get(
        `/mindmaps/verify-invitation/${invitationToken}`
      );
      
      if (response.data.success) {
        setMindmapId(response.data.mindmapId);
        setMindmapTitle(response.data.mindmapTitle);
        setError(null);
      } else {
        setError(response.data.message || 'Invalid or expired invitation.');
      }
    } catch (err: any) {
      console.error('Failed to verify invitation:', err);
      setError(
        err.response?.data?.message || 
        'Failed to verify invitation. It may be expired or invalid.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token) {
      setError('Token is missing.');
      return;
    }

    try {
      setAccepting(true);
      const response = await apiClient.post(`/mindmaps/accept-invitation/${token}`);
      
      if (response.data.success || response.status === 200) {
        // Use mindmapId from response, fallback to state if available
        const redirectId = response.data.mindmapId || mindmapId;
        if (redirectId) {
          router.push(`/editor/${redirectId}`);
        } else {
          setError('Unable to determine mindmap ID. Please try again.');
        }
      } else {
        setError(response.data.message || 'Failed to accept invitation.');
      }
    } catch (err: any) {
      console.error('Failed to accept invitation:', err);
      setError(
        err.response?.data?.message || 
        'Failed to accept the invitation. Please try again.'
      );
    } finally {
      setAccepting(false);
    }
  };

  const handleRejectInvitation = async () => {
    if (!token) {
      setError('Token is missing.');
      return;
    }

    try {
      setAccepting(true);
      await apiClient.post(`/mindmaps/reject-invitation/${token}`);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Failed to reject invitation:', err);
      setError(
        err.response?.data?.message || 
        'Failed to reject the invitation. Please try again.'
      );
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Verifying your invitation...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invitation Error
          </h1>
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Collaboration Invitation
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            You have been invited to collaborate on:
          </p>
          <p className="text-lg font-semibold text-primary">
            {mindmapTitle}
          </p>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Accept this invitation to access the mindmap and start collaborating with the team.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleAcceptInvitation}
            disabled={accepting}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition font-medium"
          >
            {accepting ? 'Accepting...' : 'Accept Invitation'}
          </button>
          
          <button
            onClick={handleRejectInvitation}
            disabled={accepting}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-400 transition font-medium"
          >
            {accepting ? 'Rejecting...' : 'Decline'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Verifying your invitation...
            </p>
          </div>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
