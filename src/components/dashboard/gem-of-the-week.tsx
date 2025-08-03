
"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import type { Gem } from '@/types';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

const initialGems: Gem[] = [
    { id: 'gem_1', name: 'WaffleCoin', coingeckoId: 'wafflecoin', currentValue: 214.00, valueWhenAdded: 186.00, valueWhenSold: null, addedBy: 'CryptoSI', dateAdded: new Date() },
];

export function GemOfTheWeek() {
  const [gems, setGems] = useState<Gem[]>(initialGems);
  const [isAddGemOpen, setIsAddGemOpen] = useState(false);
  const [newGem, setNewGem] = useState({
      name: '',
      coingeckoId: '',
      currentValue: '',
      valueWhenAdded: '',
      valueWhenSold: '',
      addedBy: 'CryptoSI' as 'CryptoSI' | 'Financial Navigator',
      dateAdded: new Date(),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewGem(prev => ({...prev, [name]: value}));
  };

  const handleSelectChange = (value: 'CryptoSI' | 'Financial Navigator') => {
    setNewGem(prev => ({ ...prev, addedBy: value }));
  };

  const handleAddGem = () => {
    const gemToAdd: Gem = {
        id: `gem_${gems.length + 1}`,
        name: newGem.name,
        coingeckoId: newGem.coingeckoId,
        currentValue: parseFloat(newGem.currentValue) || 0,
        valueWhenAdded: parseFloat(newGem.valueWhenAdded) || 0,
        valueWhenSold: newGem.valueWhenSold ? parseFloat(newGem.valueWhenSold) : null,
        addedBy: newGem.addedBy,
        dateAdded: new Date(),
    };
    setGems(prev => [...prev, gemToAdd]);
    setIsAddGemOpen(false);
    setNewGem({ name: '', coingeckoId: '', currentValue: '', valueWhenAdded: '', valueWhenSold: '', addedBy: 'CryptoSI', dateAdded: new Date() });
  };

  const calculateChange = (current: number, added: number) => {
    if (added === 0) return 0;
    return ((current - added) / added) * 100;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>💎 Gem of the Week</CardTitle>
                <CardDescription>Manage and track your portfolio gems.</CardDescription>
            </div>
            <Button size="sm" onClick={() => setIsAddGemOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Gem
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Added By</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="hidden sm:table-cell">Added At</TableHead>
                <TableHead>Change</TableHead>
                <TableHead className="hidden sm:table-cell">Sold At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gems.map((gem) => {
                const change = calculateChange(gem.currentValue, gem.valueWhenAdded);
                return (
                    <TableRow key={gem.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person avatar" />
                              <AvatarFallback>{gem.addedBy.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{gem.addedBy}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                            <div className="font-medium">{gem.name}</div>
                            <div className="text-sm text-muted-foreground">{gem.coingeckoId}</div>
                        </TableCell>
                        <TableCell>${gem.currentValue.toFixed(2)}</TableCell>
                        <TableCell>{format(gem.dateAdded, 'PP')}</TableCell>
                        <TableCell className="hidden sm:table-cell">${gem.valueWhenAdded.toFixed(2)}</TableCell>
                        <TableCell className={cn(
                            'font-medium',
                            change > 0 ? 'text-green-500' : 'text-red-500'
                        )}>
                            {change.toFixed(2)}%
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{gem.valueWhenSold ? `$${gem.valueWhenSold.toFixed(2)}` : '-'}</TableCell>
                    </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddGemOpen} onOpenChange={setIsAddGemOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Add a New Gem</DialogTitle>
                <DialogDescription>Enter the details of the new cryptocurrency gem to track.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={newGem.name} onChange={handleInputChange} placeholder="e.g., WaffleCoin" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="coingeckoId">CoinGecko API Name</Label>
                    <div className="flex items-center gap-2">
                      <Input id="coingeckoId" name="coingeckoId" value={newGem.coingeckoId} onChange={handleInputChange} placeholder="e.g., wafflecoin" />
                      <Button>Fetch</Button>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="addedBy">Added By</Label>
                    <Select onValueChange={handleSelectChange} defaultValue={newGem.addedBy}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select author" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CryptoSI">CryptoSI</SelectItem>
                            <SelectItem value="Financial Navigator">Financial Navigator</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="currentValue">Current Value ($)</Label>
                    <Input id="currentValue" name="currentValue" type="number" value={newGem.currentValue} onChange={handleInputChange} placeholder="e.g., 214.00" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="valueWhenAdded">Value When Added ($)</Label>
                    <Input id="valueWhenAdded" name="valueWhenAdded" type="number" value={newGem.valueWhenAdded} onChange={handleInputChange} placeholder="e.g., 186.00" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="valueWhenSold">Value When Sold ($) (Optional)</Label>
                    <Input id="valueWhenSold" name="valueWhenSold" type="number" value={newGem.valueWhenSold} onChange={handleInputChange} placeholder="e.g., 300.00" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddGemOpen(false)}>Cancel</Button>
                <Button onClick={handleAddGem}>Add Gem</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
