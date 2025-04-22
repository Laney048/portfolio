import React from 'react';
import { useLocation, Link } from 'wouter';
import { Mic, List, CheckSquare, Users, User } from 'lucide-react';

export default function Sidebar() {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };
  
  return (
    <div className="w-64 h-full bg-gray-800 text-white p-4 flex flex-col shrink-0">
      <h1 className="text-2xl font-bold mb-8 flex items-center">
        <Mic className="h-6 w-6 mr-2" />
        Meeting Assistant
      </h1>
      
      <nav className="space-y-2">
        <Link href="/">
          <a 
            className={`flex items-center space-x-3 w-full p-3 rounded-lg ${
              isActive('/') ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <Mic size={20} />
            <span>Record Meeting</span>
          </a>
        </Link>
        
        <Link href="/meetings">
          <a 
            className={`flex items-center space-x-3 w-full p-3 rounded-lg ${
              isActive('/meetings') ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <List size={20} />
            <span>Past Meetings</span>
          </a>
        </Link>
        
        <Link href="/action-items">
          <a 
            className={`flex items-center space-x-3 w-full p-3 rounded-lg ${
              isActive('/action-items') ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <CheckSquare size={20} />
            <span>Action Items</span>
          </a>
        </Link>
        
        <Link href="/team">
          <a 
            className={`flex items-center space-x-3 w-full p-3 rounded-lg ${
              isActive('/team') ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <Users size={20} />
            <span>Team Members</span>
          </a>
        </Link>
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center space-x-3 p-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <p className="font-medium">Admin User</p>
            <p className="text-sm text-gray-300">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
