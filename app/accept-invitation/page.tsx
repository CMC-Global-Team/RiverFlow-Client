'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import apiClient from '@/lib/apiClient';
import { Loader2, Check } from 'lucide-react';

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mindmapId, setMindmapId] = useState<string | null>(null);
  const [mindmapTitle, setMindmapTitle] = useState<string>('');
  const [accepting, setAccepting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (token) {
      verifyInvitation(token);
    } else {
      setError('Invalid invitation link. Token is missing.');
      setLoading(false);
    }
  }, [token, isAuthLoading, router]);

  const verifyInvitation = async (invitationToken: string) => {
    try {
      setLoading(true);
      let response = await apiClient.get(
        `/mindmaps/verify-invitation/${invitationToken}`,
        { withCredentials: true, headers: { 'X-Allow-Public-Auth': '1' } }
      );
      if (!(response.data && (response.data.success || response.status === 200))) {
        response = await apiClient.get(`/mindmaps/verify-invitation`, {
          params: { token: invitationToken },
          withCredentials: true,
          headers: { 'X-Invitation-Token': invitationToken, 'X-Share-Token': invitationToken, 'X-Allow-Public-Auth': '1' },
        });
      }
      if (!(response.data && (response.data.success || response.status === 200))) {
        response = await apiClient.get(`/mindmaps/invitations/verify`, {
          params: { token: invitationToken },
          withCredentials: true,
          headers: { 'X-Invitation-Token': invitationToken, 'X-Share-Token': invitationToken, 'X-Allow-Public-Auth': '1' },
        });
      }

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
      const response = await apiClient.post(`/invitations/${token}/accept`, null, {
        headers: { 'X-Allow-Public-Auth': '1' },
      });

      if (response.data.success || response.status === 200) {
        // Check if user needs to authenticate
        if (response.data.requiresAuth) {
          setSuccess(true);
          setSuccessMessage(response.data.message || 'Invitation accepted! Please sign in to access the mindmap.');
          // Redirect to homepage after 2 seconds (user can sign in from there)
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          // Show success message and redirect to editor
          setSuccess(true);
          setSuccessMessage(response.data.message || 'Lời mời được chấp nhận thành công!');

          const redirectId = response.data.mindmapId || mindmapId;
          if (redirectId) {
            setTimeout(() => {
              router.push(`/editor?id=${redirectId}`);
            }, 2000);
          }
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
      await apiClient.post(`/invitations/${token}/decline`, null, {
        headers: { 'X-Allow-Public-Auth': '1' },
      });

      // Redirect to home page for non-authenticated users, or dashboard for authenticated
      router.push('/');
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

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Thành công!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {successMessage}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Đang chuyển hướng đến mindmap...
          </p>
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

        {error && (
          <div className="mb-4">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </p>
          </div>
        )}

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
