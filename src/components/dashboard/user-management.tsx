
"use client";

import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import type { Subscriber, CreateSubscriberInput, CreditTransaction } from '@/types';
import { CreditTransactionSource, CreditTransactionType } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, User as UserIcon, Mail, XCircle, Pencil, Search, Loader2, CheckCircle, ArrowUpDown, Calendar, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSubscribers } from '@/hooks/use-subscribers';
import { Skeleton } from '@/components/ui/skeleton';
import { SupabaseService } from '@/lib/supabase-service';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserManagementSkeleton } from './user-management-skeleton';
import { UserRowSkeleton, ListItemSkeleton, LoadingSpinner, ButtonLoading } from '@/components/ui/loading-skeleton';
import { useOptimisticSubscribers } from '@/hooks/use-optimistic-updates';

const getStatusBadge = (subscriber: Subscriber) => {
  if (!subscriber.is_active) {
    return <Badge variant="destructive">Inactive</Badge>;
  }
  if (subscriber.is_super_admin) {
    return <Badge variant="default">Super Admin</Badge>;
  }
  if (subscriber.is_admin) {
    return <Badge variant="secondary">Admin</Badge>;
  }
  return <Badge variant="outline">Active</Badge>;
};

// Memoized subscriber row component for better performance
const SubscriberRow = memo(function SubscriberRow({ 
  subscriber, 
  isSubscriberPending, 
  onViewDetails, 
  onEditCredits, 
  onEditTelegram, 
  onStatusChange, 
  isProcessing 
}: {
  subscriber: Subscriber;
  isSubscriberPending: boolean;
  onViewDetails: (subscriber: Subscriber) => void;
  onEditCredits: (subscriber: Subscriber) => void;
  onEditTelegram: (subscriber: Subscriber) => void;
  onStatusChange: (subscriber: Subscriber, action: 'delete' | 'activate') => void;
  isProcessing: boolean;
}) {
  const handleViewDetails = useCallback(() => onViewDetails(subscriber), [onViewDetails, subscriber]);
  const handleEditCredits = useCallback(() => onEditCredits(subscriber), [onEditCredits, subscriber]);
  const handleEditTelegram = useCallback(() => onEditTelegram(subscriber), [onEditTelegram, subscriber]);
  const handleDelete = useCallback(() => onStatusChange(subscriber, 'delete'), [onStatusChange, subscriber]);
  const handleActivate = useCallback(() => onStatusChange(subscriber, 'activate'), [onStatusChange, subscriber]);

  return (
    <TableRow className={isSubscriberPending ? 'opacity-60' : ''}>
      <TableCell>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar>
              <AvatarImage src={subscriber.avatar_url || `https://placehold.co/40x40.png`} data-ai-hint="person avatar" />
              <AvatarFallback>
                {(subscriber.full_name || subscriber.username || subscriber.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isSubscriberPending && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <div className="font-medium">
              {subscriber.full_name || subscriber.username || 'Unknown User'}
            </div>
            <div className="text-sm text-muted-foreground">{subscriber.email || 'No email'}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{subscriber.telegram_id || '-'}</TableCell>
      <TableCell className="hidden sm:table-cell">{getStatusBadge(subscriber)}</TableCell>
      <TableCell>{subscriber.credits}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleViewDetails}>
              <UserIcon className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleEditCredits}
              disabled={isProcessing}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Credits
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleEditTelegram}
              disabled={isProcessing}
            >
              <Mail className="mr-2 h-4 w-4" />
              Edit Telegram ID
            </DropdownMenuItem>
            {!subscriber.is_active ? (
              <DropdownMenuItem 
                onClick={handleActivate}
                disabled={isProcessing}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate User
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
                disabled={isProcessing}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

export const UserManagement = memo(function UserManagement() {
  const {
    subscribers: baseSubscribers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    totalCount,
    hasMore,
    loadMore,
    refresh,
    isRealtimeConnected,
    realtimeError,
    lastRealtimeUpdate
  } = useSubscribers({ initialLimit: 50, enableRealtime: true });

  // Set up optimistic updates
  const {
    data: subscribers,
    updateBaseData,
    optimisticUpdate,
    optimisticAdd,
    optimisticDelete,
    isPending
  } = useOptimisticSubscribers(baseSubscribers);

  // Update optimistic data when base data changes
  useEffect(() => {
    updateBaseData(baseSubscribers);
  }, [baseSubscribers, updateBaseData]);

  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditCreditsOpen, setIsEditCreditsOpen] = useState(false);
  const [isEditTelegramOpen, setIsEditTelegramOpen] = useState(false);
  const [creditsToEdit, setCreditsToEdit] = useState<number | string>('');
  // Removed creditDescription state - no longer needed
  const [telegramIdToEdit, setTelegramIdToEdit] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Credit history state
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [loadingCreditHistory, setLoadingCreditHistory] = useState(false);
  const [creditHistoryError, setCreditHistoryError] = useState<string | null>(null);
  const [creditHistoryFilter, setCreditHistoryFilter] = useState<'all' | CreditTransactionType>('all');
  const [creditHistorySortOrder, setCreditHistorySortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteTelegramId, setInviteTelegramId] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const supabaseService = new SupabaseService();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleViewDetails = async (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setIsUserDetailsOpen(true);
    
    // Load credit history when opening details
    await loadCreditHistory(subscriber.user_id);
  };

  const loadCreditHistory = async (userId: string) => {
    setLoadingCreditHistory(true);
    setCreditHistoryError(null);
    
    try {
      const transactions = await supabaseService.getCreditTransactions(userId, {
        limit: 100,
        sortOrder: creditHistorySortOrder
      });
      setCreditHistory(transactions);
    } catch (error) {
      console.error('Error loading credit history:', error);
      setCreditHistoryError(error instanceof Error ? error.message : 'Failed to load credit history');
      setCreditHistory([]);
    } finally {
      setLoadingCreditHistory(false);
    }
  };

  const handleCreditHistoryFilterChange = (filter: 'all' | CreditTransactionType) => {
    setCreditHistoryFilter(filter);
  };

  const handleCreditHistorySortChange = async (sortOrder: 'asc' | 'desc') => {
    setCreditHistorySortOrder(sortOrder);
    if (selectedSubscriber) {
      await loadCreditHistory(selectedSubscriber.user_id);
    }
  };

  const getFilteredCreditHistory = () => {
    if (creditHistoryFilter === 'all') {
      return creditHistory;
    }
    return creditHistory.filter(transaction => transaction.type === creditHistoryFilter);
  };

  const formatTransactionType = (type: CreditTransactionType) => {
    switch (type) {
      case CreditTransactionType.PURCHASE:
        return 'Purchase';
      case CreditTransactionType.SPEND:
        return 'Spend';
      case CreditTransactionType.AIRDROP:
        return 'Airdrop';
      case CreditTransactionType.ADJUSTMENT:
        return 'Adjustment';
      default:
        return type;
    }
  };

  const formatTransactionSource = (source: CreditTransactionSource) => {
    switch (source) {
      case CreditTransactionSource.MANUAL:
        return 'Manual';
      case CreditTransactionSource.STRIPE:
        return 'Stripe';
      case CreditTransactionSource.PAYPAL:
        return 'PayPal';
      case CreditTransactionSource.ETHEREUM:
        return 'Ethereum';
      case CreditTransactionSource.BASE:
        return 'Base';
      case CreditTransactionSource.SOLANA:
        return 'Solana';
      case CreditTransactionSource.POLYGON:
        return 'Polygon';
      case CreditTransactionSource.IMAGE_GENERATION:
        return 'Image Generation';
      case CreditTransactionSource.REFUND:
        return 'Refund';
      case CreditTransactionSource.API:
        return 'API';
      default:
        return source;
    }
  };

  const getTransactionTypeColor = (type: CreditTransactionType) => {
    switch (type) {
      case CreditTransactionType.PURCHASE:
        return 'text-green-600';
      case CreditTransactionType.SPEND:
        return 'text-red-600';
      case CreditTransactionType.AIRDROP:
        return 'text-blue-600';
      case CreditTransactionType.ADJUSTMENT:
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleOpenEditCredits = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setCreditsToEdit('');
    setIsEditCreditsOpen(true);
  };

  const handleOpenEditTelegram = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setTelegramIdToEdit(subscriber.telegram_id || '');
    setIsEditTelegramOpen(true);
  };
  
  const handleSaveCredits = async () => {
    if (!selectedSubscriber) return;
    
    const creditChange = typeof creditsToEdit === 'string' ? parseInt(creditsToEdit, 10) : creditsToEdit;
    
    if (isNaN(creditChange) || creditChange === 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid credit amount (positive to add, negative to deduct).",
        variant: "destructive",
      });
      return;
    }

    // Removed description validation - no longer required

    setIsProcessing(true);
    
    try {
      // Optimistically update credits
      const newCredits = selectedSubscriber.credits + creditChange;
      await optimisticUpdate(
        selectedSubscriber.user_id,
        { credits: newCredits },
        async () => {
          await supabaseService.updateSubscriberCredits(
            selectedSubscriber.user_id,
            creditChange,
            `Credit ${creditChange > 0 ? 'addition' : 'deduction'} via dashboard`,
            CreditTransactionSource.MANUAL
          );
          
          // Return the updated subscriber (we'll get this from the real-time update)
          return { ...selectedSubscriber, credits: newCredits };
        }
      );

      toast({
        title: "Credits Updated",
        description: `Successfully ${creditChange > 0 ? 'added' : 'deducted'} ${Math.abs(creditChange)} credits ${creditChange > 0 ? 'to' : 'from'} ${selectedSubscriber.full_name || selectedSubscriber.username || 'subscriber'}.`,
      });
      
      // Refresh credit history if user details dialog is open
      if (isUserDetailsOpen && selectedSubscriber) {
        await loadCreditHistory(selectedSubscriber.user_id);
      }
      
      setIsEditCreditsOpen(false);
      setSelectedSubscriber(null);
      setCreditsToEdit('');
    } catch (error) {
      console.error('Error updating credits:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update credits. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTelegramId = async () => {
    if (!selectedSubscriber) return;

    // Validate telegram ID format (optional - can be empty)
    const trimmedTelegramId = telegramIdToEdit.trim();
    if (trimmedTelegramId && !/^@?[a-zA-Z0-9_]{5,32}$/.test(trimmedTelegramId)) {
      toast({
        title: "Invalid Telegram ID",
        description: "Telegram ID should be 5-32 characters long and contain only letters, numbers, and underscores. It may optionally start with @.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Optimistically update telegram ID
      await optimisticUpdate(
        selectedSubscriber.user_id,
        { telegram_id: trimmedTelegramId || undefined },
        async () => {
          await supabaseService.updateSubscriber(selectedSubscriber.user_id, {
            telegram_id: trimmedTelegramId || undefined
          });
          return { ...selectedSubscriber, telegram_id: trimmedTelegramId || undefined };
        }
      );

      toast({
        title: "Telegram ID Updated",
        description: `Successfully updated Telegram ID for ${selectedSubscriber.full_name || selectedSubscriber.username || 'subscriber'}.`,
      });
      
      setIsEditTelegramOpen(false);
      setSelectedSubscriber(null);
      setTelegramIdToEdit('');
    } catch (error) {
      console.error('Error updating Telegram ID:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update Telegram ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (subscriber: Subscriber, action: 'delete' | 'activate') => {
    setIsProcessing(true);
    
    try {
      let updateData: { is_active?: boolean; is_admin?: boolean } = {};
      let actionDescription = '';
      
      switch (action) {
        case 'delete':
          // Handle deletion separately with confirmation
          if (!confirm(`Are you sure you want to delete "${subscriber.full_name || subscriber.username || subscriber.email}"? This action cannot be undone.`)) {
            setIsProcessing(false);
            return;
          }
          
          // Optimistically remove from UI
          await optimisticDelete(subscriber.user_id, async () => {
            await supabaseService.deleteSubscriber(subscriber.user_id);
          });

          toast({
            title: "User Deleted",
            description: `Successfully deleted ${subscriber.full_name || subscriber.username || 'subscriber'}.`,
          });
          
          setIsProcessing(false);
          return;
        case 'activate':
          updateData = { is_active: true };
          actionDescription = 'activated';
          break;
      }

      // Optimistically update status
      await optimisticUpdate(
        subscriber.user_id,
        updateData,
        async () => {
          await supabaseService.updateSubscriber(subscriber.user_id, updateData);
          return { ...subscriber, ...updateData };
        }
      );

      toast({
        title: "Status Updated",
        description: `Successfully ${actionDescription} ${subscriber.full_name || subscriber.username || 'subscriber'}.`,
      });
    } catch (error) {
      console.error(`Error ${action}ing subscriber:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} subscriber. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInviteSubmit = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the invitation.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Validate telegram ID if provided
      const trimmedTelegramId = inviteTelegramId.trim();
      if (trimmedTelegramId && !/^@?[a-zA-Z0-9_]{5,32}$/.test(trimmedTelegramId)) {
        toast({
          title: "Invalid Telegram ID",
          description: "Telegram ID should be 5-32 characters long and contain only letters, numbers, and underscores. It may optionally start with @.",
          variant: "destructive",
        });
        return;
      }

      const newSubscriberData: CreateSubscriberInput = {
        email: inviteEmail.trim(),
        full_name: inviteFullName.trim() || undefined,
        username: inviteUsername.trim() || undefined,
        telegram_id: trimmedTelegramId || undefined,
        joined_via: 'site'
      };

      // Optimistically add the new subscriber
      const optimisticSubscriber = {
        user_id: `temp-${Date.now()}`,
        email: inviteEmail.trim(),
        full_name: inviteFullName.trim() || undefined,
        username: inviteUsername.trim() || undefined,
        telegram_id: trimmedTelegramId || undefined,
        joined_via: 'site' as const,
        is_active: true,
        joined_at: new Date().toISOString(),
        engagement_score: 0,
        credits: 0,
        is_admin: false,
        is_super_admin: false
      };

      await optimisticAdd(optimisticSubscriber, async () => {
        return await supabaseService.createSubscriber(newSubscriberData);
      });

      toast({
        title: "Invitation Sent",
        description: `Successfully created subscriber account for ${inviteEmail}. They can now access the platform.`,
      });
      
      // Reset form and close dialog
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteFullName('');
      setInviteUsername('');
      setInviteTelegramId('');
    } catch (error) {
      console.error('Error creating subscriber:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create subscriber. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!loading && hasMore) {
      await loadMore();
    }
  };

  // Show full skeleton on initial load
  if (loading && subscribers.length === 0 && !error) {
    return <UserManagementSkeleton />;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 h-auto hover:bg-muted/50"
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
              User Management
              {/* Real-time connection indicator */}
              <div className="flex items-center gap-1">
                {isRealtimeConnected ? (
                  <div className="flex items-center gap-1 text-green-600" title="Real-time updates active">
                    <Wifi className="h-4 w-4" />
                    <span className="text-xs">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-600" title={realtimeError || "Real-time updates disconnected"}>
                    <WifiOff className="h-4 w-4" />
                    <span className="text-xs">Offline</span>
                  </div>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              Manage your community members. {totalCount > 0 && `${totalCount} total subscribers`}
              {lastRealtimeUpdate && (
                <span className="ml-2 text-xs text-muted-foreground">
                  Last update: {lastRealtimeUpdate.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          <div className={`flex items-center gap-2 transition-all duration-300 ${
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            {isClient && (
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, email, or Telegram ID..."
                  className="pl-8 sm:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            <ButtonLoading
              variant="outline"
              size="sm"
              onClick={refresh}
              loading={loading}
              loadingText="Refreshing..."
            >
              Refresh
            </ButtonLoading>
            <Button size="sm" onClick={() => setIsInviteOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Invite New Member
            </Button>
          </div>
        </CardHeader>
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
          }`}
        >
          <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">Error loading subscribers: {error}</p>
              <ButtonLoading
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={refresh}
                loading={loading}
                loadingText="Retrying..."
              >
                Retry
              </ButtonLoading>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">Telegram ID</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No subscribers found matching your search.' : 'No subscribers found.'}
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((subscriber) => {
                  const isSubscriberPending = isPending(subscriber.user_id);
                  return (
                    <SubscriberRow
                      key={subscriber.user_id}
                      subscriber={subscriber}
                      isSubscriberPending={isSubscriberPending}
                      onViewDetails={handleViewDetails}
                      onEditCredits={handleOpenEditCredits}
                      onEditTelegram={handleOpenEditTelegram}
                      onStatusChange={handleStatusChange}
                      isProcessing={isProcessing}
                    />
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Load More Button */}
          {hasMore && subscribers.length > 0 && (
            <div className="flex justify-center mt-4">
              <ButtonLoading
                variant="outline"
                onClick={handleLoadMore}
                loading={loading}
                loadingText="Loading more..."
              >
                Load More
              </ButtonLoading>
            </div>
          )}

          {/* Results summary */}
          {subscribers.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Showing {subscribers.length} of {totalCount} subscribers
            </div>
          )}
          </CardContent>
        </div>
      </Card>

      <Dialog open={isUserDetailsOpen} onOpenChange={(open) => {
        setIsUserDetailsOpen(open);
        if (!open) {
          // Clear credit history when dialog is closed
          setCreditHistory([]);
          setCreditHistoryError(null);
          setLoadingCreditHistory(false);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedSubscriber?.full_name || selectedSubscriber?.username || 'this subscriber'}.
            </DialogDescription>
          </DialogHeader>
          {selectedSubscriber && (
            <div className="space-y-4">
               <div className="flex items-center gap-4 pt-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedSubscriber.avatar_url || `https://placehold.co/80x80.png`} data-ai-hint="person avatar" />
                    <AvatarFallback>
                      {(selectedSubscriber.full_name || selectedSubscriber.username || selectedSubscriber.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xl font-bold">
                      {selectedSubscriber.full_name || selectedSubscriber.username || 'Unknown User'}
                    </div>
                    <div className="text-sm text-muted-foreground">{selectedSubscriber.email || 'No email'}</div>
                    <div className="text-sm text-muted-foreground">{selectedSubscriber.telegram_id || 'No Telegram ID'}</div>
                    <div className="mt-1">{getStatusBadge(selectedSubscriber)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Credits:</span> {selectedSubscriber.credits}
                  </div>
                  <div>
                    <span className="font-medium">Engagement Score:</span> {selectedSubscriber.engagement_score}
                  </div>
                  <div>
                    <span className="font-medium">Joined:</span> {new Date(selectedSubscriber.joined_at).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Joined Via:</span> {selectedSubscriber.joined_via || 'Unknown'}
                  </div>
                  {selectedSubscriber.wallet_address && (
                    <div className="col-span-2">
                      <span className="font-medium">Wallet:</span> 
                      <span className="ml-2 font-mono text-xs">{selectedSubscriber.wallet_address}</span>
                    </div>
                  )}
                </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Credit History</CardTitle>
                      <CardDescription>
                        Transaction history for this subscriber
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={creditHistoryFilter} onValueChange={handleCreditHistoryFilterChange}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value={CreditTransactionType.PURCHASE}>Purchase</SelectItem>
                          <SelectItem value={CreditTransactionType.SPEND}>Spend</SelectItem>
                          <SelectItem value={CreditTransactionType.AIRDROP}>Airdrop</SelectItem>
                          <SelectItem value={CreditTransactionType.ADJUSTMENT}>Adjustment</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreditHistorySortChange(creditHistorySortOrder === 'desc' ? 'asc' : 'desc')}
                      >
                        <ArrowUpDown className="h-4 w-4 mr-1" />
                        {creditHistorySortOrder === 'desc' ? 'Newest' : 'Oldest'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingCreditHistory ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <ListItemSkeleton key={index} />
                      ))}
                    </div>
                  ) : creditHistoryError ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-destructive mb-2">{creditHistoryError}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => selectedSubscriber && loadCreditHistory(selectedSubscriber.user_id)}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : getFilteredCreditHistory().length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      {creditHistoryFilter === 'all' 
                        ? 'No credit transactions found' 
                        : `No ${formatTransactionType(creditHistoryFilter).toLowerCase()} transactions found`
                      }
                    </div>
                  ) : (
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {getFilteredCreditHistory().map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge 
                                  variant="outline" 
                                  className={getTransactionTypeColor(transaction.type)}
                                >
                                  {formatTransactionType(transaction.type)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTransactionSource(transaction.source)}
                                </span>
                              </div>
                              {transaction.description && (
                                <p className="text-sm text-muted-foreground mb-1">
                                  {transaction.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(transaction.timestamp).toLocaleString()}
                              </div>
                              {transaction.transaction_id && (
                                <p className="text-xs text-muted-foreground font-mono mt-1">
                                  ID: {transaction.transaction_id}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className={`font-medium ${
                                transaction.type === CreditTransactionType.PURCHASE || 
                                transaction.type === CreditTransactionType.AIRDROP ||
                                transaction.type === CreditTransactionType.ADJUSTMENT
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {transaction.type === CreditTransactionType.SPEND ? '-' : '+'}
                                {transaction.credits}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                credits
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Invite New Member</DialogTitle>
                <DialogDescription>Create a new subscriber account. They will be able to access the platform immediately.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="invite-email">Email Address *</Label>
                    <Input 
                      id="invite-email" 
                      type="email" 
                      placeholder="name@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={isProcessing}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="invite-fullname">Full Name</Label>
                    <Input 
                      id="invite-fullname" 
                      type="text" 
                      placeholder="John Doe"
                      value={inviteFullName}
                      onChange={(e) => setInviteFullName(e.target.value)}
                      disabled={isProcessing}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="invite-username">Username</Label>
                    <Input 
                      id="invite-username" 
                      type="text" 
                      placeholder="johndoe"
                      value={inviteUsername}
                      onChange={(e) => setInviteUsername(e.target.value)}
                      disabled={isProcessing}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="invite-telegram">Telegram ID</Label>
                    <Input 
                      id="invite-telegram" 
                      type="text" 
                      placeholder="@username or username"
                      value={inviteTelegramId}
                      onChange={(e) => setInviteTelegramId(e.target.value)}
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional. Should be 5-32 characters long and contain only letters, numbers, and underscores.
                    </p>
                </div>
            </div>
            <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsInviteOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleInviteSubmit}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Subscriber'
                  )}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCreditsOpen} onOpenChange={setIsEditCreditsOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Credits for {selectedSubscriber?.full_name || selectedSubscriber?.username || 'User'}</DialogTitle>
                <DialogDescription>
                  Current balance: {selectedSubscriber?.credits || 0} credits. 
                  Enter a positive number to add credits or negative to deduct.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="credits">Credit Change</Label>
                    <Input 
                      id="credits" 
                      type="number" 
                      placeholder="e.g., 100 (add) or -50 (deduct)"
                      value={creditsToEdit} 
                      onChange={(e) => setCreditsToEdit(e.target.value)}
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-muted-foreground">
                      New balance will be: {selectedSubscriber ? selectedSubscriber.credits + (parseInt(creditsToEdit.toString()) || 0) : 0} credits
                    </p>
                </div>
                {/* Removed description field - no longer required */}
            </div>
            <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditCreditsOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveCredits}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Credits'
                  )}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTelegramOpen} onOpenChange={setIsEditTelegramOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Telegram ID for {selectedSubscriber?.full_name || selectedSubscriber?.username || 'User'}</DialogTitle>
                <DialogDescription>
                  Current Telegram ID: {selectedSubscriber?.telegram_id || 'Not set'}. 
                  Enter a valid Telegram username or leave empty to remove.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="telegram-id">Telegram ID</Label>
                    <Input 
                      id="telegram-id" 
                      type="text" 
                      placeholder="e.g., @username or username"
                      value={telegramIdToEdit} 
                      onChange={(e) => setTelegramIdToEdit(e.target.value)}
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-muted-foreground">
                      Telegram ID should be 5-32 characters long and contain only letters, numbers, and underscores. The @ symbol is optional.
                    </p>
                </div>
            </div>
            <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditTelegramOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveTelegramId}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Telegram ID'
                  )}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
