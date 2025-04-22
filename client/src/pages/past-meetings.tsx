import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStatusColor, simulateDelay } from "@/lib/utils";
import { AvatarGroup } from "@/components/ui/avatar-group";
import MeetingDetail from "@/components/meeting-detail";
import { Calendar, Clock, Search, FileCheck } from 'lucide-react';
import { type MeetingWithDetails } from "@shared/schema";

export default function PastMeetings() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingWithDetails | null>(null);
  
  // Fetch meetings
  const { data: meetings = [], isLoading, error } = useQuery({
    queryKey: ['/api/meetings'],
  });

  if (error) {
    toast({
      title: "Error loading meetings",
      description: "There was an error loading your meetings. Please try again.",
      variant: "destructive"
    });
  }

  // Filter meetings based on search and status
  const filteredMeetings = meetings.filter((meeting: MeetingWithDetails) => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          meeting.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleMeetingClick = (meeting: MeetingWithDetails) => {
    setSelectedMeeting(meeting);
  };

  const handleCloseDetail = () => {
    setSelectedMeeting(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {!selectedMeeting ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Past Meetings</h2>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search meetings..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All meetings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All meetings</SelectItem>
                  <SelectItem value="Analyzed">Analyzed</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading meetings...</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">No meetings found matching your criteria.</p>
              {searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {filteredMeetings.map((meeting: MeetingWithDetails) => (
                <div
                  key={meeting.id}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer"
                  onClick={() => handleMeetingClick(meeting)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{meeting.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {meeting.date}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {meeting.duration}
                      </div>
                    </div>
                    <div>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">{meeting.summary}</p>
                  <div className="flex justify-between items-center mt-4">
                    <AvatarGroup 
                      users={meeting.participants.map(name => ({ name }))}
                      max={3}
                    />
                    <div className="flex items-center text-xs">
                      <FileCheck className="h-4 w-4 text-primary mr-1" />
                      <span>{meeting.actionItems?.length || 0} Action Items</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <MeetingDetail meeting={selectedMeeting} onClose={handleCloseDetail} />
      )}
    </div>
  );
}
