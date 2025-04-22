import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStatusColor, simulateDelay } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { ActionItem } from "@shared/schema";

export default function ActionItems() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  
  // Fetch action items and users
  const { data: actionItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['/api/action-items'],
  });
  
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });

  // Update action item completion status
  const updateActionItem = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      return apiRequest('PATCH', `/api/action-items/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/action-items'] });
    },
    onError: () => {
      toast({
        title: "Error updating action item",
        description: "There was an error updating the action item. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Filter action items based on status and assignee
  const filteredItems = actionItems.filter((item: ActionItem) => {
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'completed' && item.completed) ||
                          (statusFilter === 'in-progress' && item.status === 'In Progress' && !item.completed) ||
                          (statusFilter === 'not-started' && item.status === 'Not Started' && !item.completed);
    
    const matchesAssignee = assigneeFilter === 'all' || item.assignee === assigneeFilter;
    
    return matchesStatus && matchesAssignee;
  });

  // Get unique assignees for the filter dropdown
  const assignees = Array.from(new Set(actionItems.map((item: ActionItem) => item.assignee)));

  // Handle checkbox change
  const handleCheckboxChange = (id: number, completed: boolean) => {
    updateActionItem.mutate({ id, completed: !completed });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Action Items</h2>
        <div className="flex space-x-3">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={assigneeFilter}
            onValueChange={setAssigneeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {assignees.map((assignee, index) => (
                <SelectItem key={index} value={assignee}>{assignee}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoadingItems || isLoadingUsers ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading action items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No action items found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex bg-gray-50 border-b p-3">
            <div className="w-12 shrink-0 text-sm font-medium text-gray-500"></div>
            <div className="flex-1 text-sm font-medium text-gray-500">Task</div>
            <div className="w-40 shrink-0 text-sm font-medium text-gray-500">Assignee</div>
            <div className="w-32 shrink-0 text-sm font-medium text-gray-500">Due Date</div>
            <div className="w-36 shrink-0 text-sm font-medium text-gray-500">Meeting</div>
            <div className="w-24 shrink-0 text-sm font-medium text-gray-500">Status</div>
          </div>
          
          {filteredItems.map((item: ActionItem) => (
            <div key={item.id} className="flex items-center p-3 border-b hover:bg-gray-50">
              <div className="w-12 shrink-0">
                <Checkbox 
                  checked={item.completed} 
                  onCheckedChange={() => handleCheckboxChange(item.id, item.completed)}
                />
              </div>
              <div className={`flex-1 font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>
                {item.task}
              </div>
              <div className="w-40 shrink-0">
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback>
                      {item.assignee.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{item.assignee}</span>
                </div>
              </div>
              <div className="w-32 shrink-0 text-sm">{item.dueDate}</div>
              <div className="w-36 shrink-0 text-sm text-primary hover:text-primary-600">
                {item.meetingId === 1 ? "Product Roadmap" : 
                 item.meetingId === 2 ? "Weekly Team Standup" : 
                 item.meetingId === 3 ? "Project Launch" : "Meeting"}
              </div>
              <div className="w-24 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                  {item.completed ? "Completed" : item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
