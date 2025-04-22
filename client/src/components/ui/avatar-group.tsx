import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarGroupProps {
  users: {
    name: string;
    image?: string;
  }[];
  max?: number;
}

export function AvatarGroup({ users, max = 3 }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length > max ? users.length - max : 0;

  return (
    <div className="flex -space-x-2">
      {displayUsers.map((user, index) => (
        <Avatar key={index} className="w-6 h-6 border border-white">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.name} />
          ) : (
            <AvatarFallback>
              {user.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          )}
        </Avatar>
      ))}
      
      {remainingCount > 0 && (
        <div className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs text-gray-600">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
