"use client";

import React, { useState, useMemo } from 'react';
import { BaccaratRecord, updateBot } from '@/helper/bot';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { Play, Square, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface PlayBaccaratTableProps {
  initialData: BaccaratRecord[];
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export const PlayBaccaratTable = ({ initialData }: PlayBaccaratTableProps) => {
  const [data, setData] = useState<BaccaratRecord[]>(initialData);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMultiLoading, setIsMultiLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Sorting
  const sortedData = useMemo(() => {
    const sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: string | number | boolean | null = (a as unknown as Record<string, string | number | boolean | null>)[sortConfig.key];
        let bValue: string | number | boolean | null = (b as unknown as Record<string, string | number | boolean | null>)[sortConfig.key];
        
        if (sortConfig.key === 'user' && a.assigned_user && b.assigned_user) {
           aValue = a.assigned_user.first_name || '';
           bValue = b.assigned_user.first_name || '';
        }

        if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1" />
    );
  };

  // Selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(sortedData.map(row => row.id.toString()));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectToggle = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Actions
  const handleAction = async (id: string, currentBotStatus: 'run' | 'stop' | null) => {
    setLoadingId(id.toString());
    const newBotStatus: 'run' | 'stop' = currentBotStatus !== 'run' ? 'run' : 'stop';

    try {
      await updateBot(id.toString(), {
        bot_status: newBotStatus
      });
      
      setData(prev => prev.map(row => 
        row.id.toString() === id.toString() ? { ...row, bot_status: newBotStatus } : row
      ));
      
      toast.success(`Bot ${newBotStatus === 'run' ? 'started' : 'stopped'} successfully`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update bot status');
    } finally {
      setLoadingId(null);
    }
  };

  const handleMultiAction = async (action: 'run' | 'stop') => {
    setIsMultiLoading(true);
    const newBotStatus: 'run' | 'stop' = action;

    let successCount = 0;
    for (const id of selectedIds) {
      try {
        await updateBot(id, {
          bot_status: newBotStatus
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to update bot ${id}`, error);
      }
    }

    if (successCount > 0) {
      setData(prev => prev.map(row => 
        selectedIds.includes(row.id.toString()) ? { ...row, bot_status: newBotStatus } : row
      ));
      toast.success(`Successfully ${action === 'run' ? 'started' : 'stopped'} ${successCount} bots`);
    }
    if (successCount < selectedIds.length) {
      toast.error(`Failed to apply action to ${selectedIds.length - successCount} bots`);
    }
    
    setIsMultiLoading(false);
    setSelectedIds([]);
  };

  const handleFieldUpdate = async (id: string, field: string, value: string | number | boolean | null) => {
    try {
      await updateBot(id.toString(), { [field]: value });
      
      setData(prev => prev.map(row => {
        if (row.id.toString() === id.toString()) {
          // map db field back to ui record field if needed
          const recordField = field === 'bet' ? 'bet_size' : field;
          return { ...row, [recordField]: value };
        }
        return row;
      }));
      
      toast.success(`Updated successfully`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to update`);
    }
  };

  const getUserName = (user: BaccaratRecord['assigned_user']) => {
    if (!user) return 'N/A';
    const parts = [user.first_name, user.middle_name, user.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'N/A';
  };

  const SortHeader = ({ title, sortKey }: { title: string, sortKey: string }) => (
    <TableHead 
      className="text-gray-400 whitespace-nowrap cursor-pointer hover:text-white transition-colors"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center">
        {title}
        {getSortIcon(sortKey)}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-[#111] border border-gray-800 rounded-md">
          <span className="text-sm text-gray-400 mr-2">
            {selectedIds.length} bot{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
            onClick={() => handleMultiAction('run')}
            disabled={isMultiLoading}
          >
            {isMultiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            Start Selected
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-2"
            onClick={() => handleMultiAction('stop')}
            disabled={isMultiLoading}
          >
            {isMultiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4 fill-current" />}
            Stop Selected
          </Button>
        </div>
      )}

      <div className="rounded-md border border-gray-800 bg-[#0A0A0A] overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#111111]">
            <TableRow className="border-gray-800">
              <TableHead className="w-[40px] px-4">
                 <Checkbox 
                   checked={selectedIds.length > 0 && selectedIds.length === data.length}
                   onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                   className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                 />
              </TableHead>
              <SortHeader title="Units" sortKey="units" />
              <SortHeader title="User" sortKey="user" />
              <SortHeader title="Status" sortKey="status" />
              <SortHeader title="Bal" sortKey="user_balance" />
              <SortHeader title="Platform" sortKey="credential_id" />
              <SortHeader title="Bet Size" sortKey="bet_size" />
              <SortHeader title="Level" sortKey="level" />
              <SortHeader title="Strategy" sortKey="strategy" />
              <SortHeader title="Pattern" sortKey="pattern" />
              <SortHeader title="TP%" sortKey="target_profit" />
              <SortHeader title="Timer" sortKey="duration" />
              <TableHead className="text-right text-gray-400 whitespace-nowrap">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center text-gray-500 py-8">
                  No bots found
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => (
                <TableRow key={row.id} className="border-gray-800 hover:bg-[#111111]">
                  <TableCell className="px-4">
                     <Checkbox 
                       checked={selectedIds.includes(row.id.toString())}
                       onCheckedChange={() => handleSelectToggle(row.id.toString())}
                       className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                     />
                  </TableCell>
                  <TableCell className="font-medium text-white whitespace-nowrap">{row.unit_name || row.units || row.id}</TableCell>
                  <TableCell className="text-gray-300 whitespace-nowrap">{getUserName(row.assigned_user)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge 
                      variant="outline" 
                      className={
                        row.status === 'Running' ? 'border-green-500 text-green-500 bg-green-500/10' :
                        row.status === 'Stopped' ? 'border-red-500 text-red-500 bg-red-500/10' :
                        'border-gray-500 text-gray-500 bg-gray-500/10'
                      }
                    >
                      {row.status || 'Idle'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300 whitespace-nowrap">{row.user_balance ? `$${Number(row.user_balance).toFixed(2)}` : '0.00'}</TableCell>
                  
                  <TableCell className="whitespace-nowrap">
                    <Select 
                      value={row.credential_id || ""} 
                      onValueChange={(val) => handleFieldUpdate(row.id.toString(), 'credential_id', val)}
                    >
                      <SelectTrigger className="min-w-[140px] h-8 text-xs bg-[#111] border-gray-700">
                        <SelectValue placeholder="Select Account" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111] border-gray-700 text-white">
                        {row.available_credentials?.map((cred) => (
                          <SelectItem key={cred.id} value={cred.id}>
                            {cred.platform_website?.platform_code || cred.platform_website?.platform_name || 'Unknown'} 
                          </SelectItem>
                        ))}
                        {(!row.available_credentials || row.available_credentials.length === 0) && (
                          <SelectItem value="none" disabled>No accounts available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
  
                  {/* Bet Size Dropdown */}
                  <TableCell className="whitespace-nowrap">
                    <Select 
                      value={row.bet_size ? String(row.bet_size) : ""} 
                      onValueChange={(val) => handleFieldUpdate(row.id.toString(), 'bet', Number(val))}
                    >
                      <SelectTrigger className="w-[80px] h-8 text-xs bg-[#111] border-gray-700">
                        <SelectValue placeholder="Bet" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111] border-gray-700 text-white">
                        {[10, 50, 100, 200].map(size => (
                          <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
  
                  {/* Level Dropdown */}
                  <TableCell className="whitespace-nowrap">
                    <Select 
                      value={row.level ? String(row.level) : ""} 
                      onValueChange={(val) => handleFieldUpdate(row.id.toString(), 'level', Number(val))}
                    >
                      <SelectTrigger className="w-[70px] h-8 text-xs bg-[#111] border-gray-700">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111] border-gray-700 text-white">
                        {Array.from({length: 14}, (_, i) => i + 1).map(level => (
                          <SelectItem key={level} value={String(level)}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
  
                  {/* Strategy Dropdown */}
                  <TableCell className="whitespace-nowrap">
                    <Select 
                      value={row.strategy || ""} 
                      onValueChange={(val) => handleFieldUpdate(row.id.toString(), 'strategy', val)}
                    >
                      <SelectTrigger className="w-[100px] h-8 text-xs bg-[#111] border-gray-700">
                        <SelectValue placeholder="Strategy" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111] border-gray-700 text-white">
                        {["standard", "sweeper", "burst", "tank"].map(s => (
                          <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
  
                  {/* Pattern Dropdown */}
                  <TableCell className="whitespace-nowrap">
                    <Select 
                      value={row.pattern || ""} 
                      onValueChange={(val) => handleFieldUpdate(row.id.toString(), 'pattern', val)}
                    >
                      <SelectTrigger className="w-[90px] h-8 text-xs bg-[#111] border-gray-700">
                        <SelectValue placeholder="Pattern" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111] border-gray-700 text-white">
                        {["P", "B", "PB", "BP", "PPPB", "BBBP"].map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
  
                  <TableCell className="text-gray-300 whitespace-nowrap">{row.target_profit ? `${row.target_profit}%` : 'N/A'}</TableCell>
                  <TableCell className="text-gray-300 whitespace-nowrap">{row.duration ? `${row.duration}m` : 'N/A'}</TableCell>
                  
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAction(row.id.toString(), row.bot_status ?? 'stop')}
                        disabled={loadingId === row.id.toString() || row.bot_status === 'run'}
                      >
                        {loadingId === row.id.toString() ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1 fill-current" /> Run
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(row.id.toString(), row.bot_status ?? 'stop')}
                        disabled={loadingId === row.id.toString() || row.bot_status !== 'run'}
                      >
                        {loadingId === row.id.toString() ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Square className="w-4 h-4 mr-1 fill-current" /> Stop
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
