import React from 'react';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, MessageSquare, ListChecks } from 'lucide-react';

export default function TeamMembers() {
  const { toast } = useToast();
  
  // Fetch users and action items
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });
  
  const { data: actionItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['/api/action-items'],
  });

  // Calculate number of open tasks for each user
  const getUserTasks = (userName: string) => {
    const userTasks = actionItems.filter((item: any) => 
      item.assignee === userName && !item.completed
    );
    return userTasks.length;
  };

  // Calculate progress percentage for each user (completed vs total tasks)
  const getUserProgress = (userName: string) => {
    const userTasks = actionItems.filter((item: any) => item.assignee === userName);
    if (userTasks.length === 0) return 0;
    
    const completedTasks = userTasks.filter((item: any) => item.completed);
    return (completedTasks.length / userTasks.length) * 100;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <Button>
          Add Team Member
        </Button>
      </div>
      
      {isLoadingUsers || isLoadingItems ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team members...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user: any) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-14 w-14 mr-4">
                      <AvatarFallback>
                        {user.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg">{user.name}</h3>
                      <p className="text-gray-600">{user.role}</p>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Assigned Tasks</span>
                    <span className="font-medium">{getUserTasks(user.name)} open</span>
                  </div>
                  <Progress value={getUserProgress(user.name)} className="h-1.5" />
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" className="flex-1 text-sm py-1.5">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" className="flex-1 text-sm py-1.5">
                    <ListChecks className="h-4 w-4 mr-2" />
                    View Tasks
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
