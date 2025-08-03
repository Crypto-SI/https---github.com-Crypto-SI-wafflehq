
"use client";

import { useState } from 'react';
import type { User } from '@/types';
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
import { MoreHorizontal, PlusCircle, User as UserIcon, Mail, ShieldAlert, XCircle, Pencil, Search } from 'lucide-react';
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

const initialUsers: User[] = [
  {
    id: 'usr_1',
    name: 'Satoshi Nakamoto',
    email: 'satoshi@gmx.com',
    status: 'Active',
    credits: 1000,
    creditHistory: [
      { date: '2023-10-01', description: 'Monthly Subscription', amount: 100 },
      { date: '2023-09-25', description: 'Gem Purchase', amount: -50 },
      { date: '2023-09-01', description: 'Monthly Subscription', amount: 100 },
    ],
  },
  {
    id: 'usr_2',
    name: 'Vitalik Buterin',
    email: 'vitalik@ethereum.org',
    status: 'Active',
    credits: 500,
    creditHistory: [
      { date: '2023-10-01', description: 'Monthly Subscription', amount: 100 },
    ],
  },
  {
    id: 'usr_3',
    name: 'Elon Musk',
    email: 'elon@x.com',
    status: 'Pending',
    credits: 0,
    creditHistory: [],
  },
  {
    id: 'usr_4',
    name: 'Do Kwon',
    email: 'do@terra.money',
    status: 'Banned',
    credits: -100,
    creditHistory: [
        { date: '2022-05-01', description: 'Penalty for LUNA', amount: -100 },
    ],
  },
];

const getStatusBadge = (status: User['status']) => {
  switch (status) {
    case 'Active':
      return <Badge variant="default">Active</Badge>;
    case 'Pending':
      return <Badge variant="secondary">Pending</Badge>;
    case 'Banned':
      return <Badge variant="destructive">Banned</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditCreditsOpen, setIsEditCreditsOpen] = useState(false);
  const [creditsToEdit, setCreditsToEdit] = useState<number | string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const handleOpenEditCredits = (user: User) => {
    setSelectedUser(user);
    setCreditsToEdit(user.credits);
    setIsEditCreditsOpen(true);
  };
  
  const handleSaveCredits = () => {
    if (selectedUser) {
      const newCredits = typeof creditsToEdit === 'string' ? parseInt(creditsToEdit, 10) : creditsToEdit;
      if (!isNaN(newCredits)) {
        setUsers(users.map(u => u.id === selectedUser.id ? {...u, credits: newCredits} : u));
      }
      setIsEditCreditsOpen(false);
      setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage your community members.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by email or username..."
                className="pl-8 sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={() => setIsInviteOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Invite New Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person avatar" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.credits}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                          <UserIcon className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEditCredits(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Credits
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Resend Invite
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Suspend User
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Ban User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information and credit history for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
               <div className="flex items-center gap-4 pt-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://placehold.co/80x80.png`} data-ai-hint="person avatar" />
                    <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xl font-bold">{selectedUser.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                    <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                  </div>
                </div>

              <Card>
                <CardHeader>
                  <CardTitle>Credit History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedUser.creditHistory.length > 0 ? selectedUser.creditHistory.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell className={`text-right font-medium ${record.amount > 0 ? 'text-primary' : 'text-destructive'}`}>
                            {record.amount > 0 ? '+' : ''}{record.amount}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">No credit history.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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
                <DialogDescription>Enter the email address to send an invitation to join CryptoWaffle.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="name@example.com" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                <Button onClick={() => { console.log('Invite sent'); setIsInviteOpen(false); }}>Send Invite</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCreditsOpen} onOpenChange={setIsEditCreditsOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Credits for {selectedUser?.name}</DialogTitle>
                <DialogDescription>Update the credit balance for this user.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="credits">Credits</Label>
                    <Input id="credits" type="number" value={creditsToEdit} onChange={(e) => setCreditsToEdit(e.target.value)} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditCreditsOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveCredits}>Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
