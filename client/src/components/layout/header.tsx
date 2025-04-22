import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Notification } from '@shared/schema';

export default function Header() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const notificationPanelRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
  });

  // Calculate unread notifications
  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('PATCH', `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  });

  // Mark all notifications as read
  const markAllAsRead = () => {
    // In a real app, you would call an API endpoint to mark all as read
    // For this demo, we'll mark them one by one
    notifications
      .filter((n: Notification) => !n.read)
      .forEach((n: Notification) => {
        markAsRead.mutate(n.id);
      });
  };

  // Handle outside click to close the notification panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-end px-6 shrink-0">
      <div className="relative" ref={notificationPanelRef}>
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10">
            <div className="py-2 px-4 bg-gray-100 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    className="text-xs text-primary hover:text-primary-600"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification: Notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 border-l-4 ${notification.read ? 'border-transparent' : 'border-red-500'}`}
                    onClick={() => !notification.read && markAsRead.mutate(notification.id)}
                  >
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-gray-500">{notification.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.date}</p>
                  </div>
                ))
              )}
            </div>
            
            <div className="py-2 px-4 border-t text-center">
              <button className="text-xs text-primary hover:text-primary-600">
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
