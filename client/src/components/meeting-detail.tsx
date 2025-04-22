import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { X, Share2, Download, Calendar, Clock } from 'lucide-react';
import type { MeetingWithDetails } from "@shared/schema";

interface MeetingDetailProps {
  meeting: MeetingWithDetails;
  onClose: () => void;
}

export default function MeetingDetail({ meeting, onClose }: MeetingDetailProps) {
  return (
    <Card className="p-6 mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold">{meeting.title}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            {meeting.date}
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Clock className="h-4 w-4 mr-1" />
            {meeting.duration}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Download className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3">Summary</h4>
            <p className="text-gray-700">{meeting.summary}</p>
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3">Key Decisions</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {meeting.decisions.map((decision, index) => (
                <li key={index}>{decision.text}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-3">Participants</h4>
            <div className="flex flex-wrap gap-2">
              {meeting.participants.map((participant, index) => (
                <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback>{getInitials(participant)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{participant}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="md:w-1/2">
          <div className="mb-4">
            <h4 className="font-semibold text-lg mb-3">Action Items</h4>
            <div className="space-y-3">
              {meeting.actionItems.map((item, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md border-l-4 border-primary">
                  <div className="flex justify-between">
                    <h5 className="font-medium">{item.task}</h5>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      Due {item.dueDate.split(',')[0]}
                    </span>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Avatar className="h-5 w-5 mr-1">
                      <AvatarFallback>{getInitials(item.assignee)}</AvatarFallback>
                    </Avatar>
                    {item.assignee}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-3">Transcription</h4>
            <div className="bg-gray-50 p-3 rounded-md h-64 overflow-y-auto">
              {meeting.transcription ? (
                meeting.transcription.trim().split('\n').map((line, index) => {
                  if (!line.trim()) return null;
                  
                  const [speaker, ...textParts] = line.split(':');
                  const text = textParts.join(':').trim();
                  
                  let speakerColor = 'text-primary-700';
                  if (speaker.includes('Jane')) speakerColor = 'text-pink-600';
                  if (speaker.includes('Alex')) speakerColor = 'text-green-600';
                  
                  return (
                    <div className="mb-3" key={index}>
                      <span className={`font-semibold ${speakerColor}`}>{speaker}: </span>
                      <span>{text}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No transcription available</p>
              )}
            </div>
            {meeting.audioUrl && (
              <audio controls className="w-full mt-4">
                <source src={meeting.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
