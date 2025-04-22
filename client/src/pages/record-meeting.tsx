import React, { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { simulateDelay } from "@/lib/utils";
import { File, FileCheck, Mic, Play, Square, Loader2 } from 'lucide-react';

export default function RecordMeeting() {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset the recording state
  const resetRecording = () => {
    setAudioUrl(null);
    setTranscription(null);
    setIsProcessing(false);
    setIsTranscribing(false);
    setAnalysisProgress(0);
    audioChunksRef.current = [];
  };

  // Handle recording start
  const handleStartRecording = async () => {
    resetRecording();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        // Start the transcription process
        processRecording();
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Your meeting is now being recorded.",
      });
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: "Error accessing microphone",
        description: "Please check your permissions and try again.",
        variant: "destructive"
      });
    }
  };

  // Handle recording stop
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Recording stopped",
        description: "Your meeting recording is being processed.",
      });
    }
  };

  // Process the recording (transcribe and analyze)
  const processRecording = async () => {
    setIsProcessing(true);
    
    // Only start transcribing if we don't already have a transcription (from CSV)
    if (!transcription) {
      setIsTranscribing(true);
      
      // Simulate transcription processing delay
      await simulateDelay(3000);
      
      // Demo transcription data - in a real app, you'd send the audio to an API
      const demoTranscription = `
John: Let's go over the key items for our new project launch.
Jane: I think we should prioritize the user onboarding flow first.
Alex: Agreed. The current flow has too much friction.
John: OK, decision made. We'll prioritize redesigning the onboarding flow.
Jane: I can take that on. I'll have designs ready by next Friday.
John: Great. Next item is the marketing campaign. I believe we should delay it until the new features are ready.
Alex: That makes sense. Let's push it to July instead of June.
John: Decision made. Marketing campaign moves to July.
Alex: I'll update the marketing team and adjust the timeline.
John: Perfect. Any other items?
Jane: We need to decide on the budget for user testing.
John: Let's allocate $5,000 for this round.
Alex: That works for me.
John: Decision made. $5,000 for user testing.
Jane: I'll coordinate with the finance team to secure that budget.
John: Thanks everyone, meeting adjourned.
`;
      
      setTranscription(demoTranscription);
      setIsTranscribing(false);
    }
    
    // Get the current transcription to use
    const currentTranscription = transcription || '';
    
    // Simulate AI analysis with progress updates
    for (let i = 0; i <= 100; i += 5) {
      setAnalysisProgress(i);
      await simulateDelay(150);
    }
    
    // Create a new meeting in the backend
    try {
      // Generate a title and summary based on the transcription
      let title = 'New Project Launch Planning';
      let summary = 'The team discussed project launch priorities, focusing on user onboarding, marketing timeline, and user testing budget.';
      
      // Try to extract better title and summary from the transcription
      if (currentTranscription) {
        const lines = currentTranscription.split('\n');
        
        // Use the first line or first decision as a potential title
        if (lines.length > 0) {
          const firstLine = lines[0].split(':')[1]?.trim() || lines[0];
          if (firstLine.length > 10 && firstLine.length < 60) {
            title = firstLine.replace(/^['".]|['".]$/g, '');
          }
          
          // Create a summary from mentioned topics
          const topics = new Set<string>();
          const topicKeywords = [
            'onboarding', 'marketing', 'budget', 'design', 'user', 'timeline', 
            'feature', 'testing', 'launch', 'project', 'decision'
          ];
          
          lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            topicKeywords.forEach(keyword => {
              if (lowerLine.includes(keyword) && !topics.has(keyword)) {
                topics.add(keyword);
              }
            });
          });
          
          if (topics.size > 0) {
            const topicsArr = Array.from(topics);
            summary = `The team discussed ${topicsArr.slice(0, -1).join(', ')}${
              topicsArr.length > 1 ? ' and ' + topicsArr[topicsArr.length - 1] : topicsArr[0]
            } for the project.`;
          }
        }
      }
      
      await apiRequest('POST', '/api/meetings', {
        title,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        duration: '25 minutes',
        status: 'Analyzed',
        summary,
        transcription: currentTranscription
      });
      
      // Extract decisions and action items from the transcription
      let decisions: string[] = [];
      let actionItems: {task: string, assignee: string, dueDate: string, status: string}[] = [];
      
      // Try to identify decisions from the transcription
      if (currentTranscription) {
        const lines = currentTranscription.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].toLowerCase();
          const fullLine = lines[i];
          
          // Look for lines with decision indicators
          if (line.includes('decision made') || 
              line.includes('decided to') || 
              line.includes('decision') || 
              line.includes('mark it as') || 
              line.includes('let\'s make sure') ||
              line.includes('let\'s add')) {
            
            const speaker = fullLine.split(':')[0]?.trim() || '';
            const text = fullLine.split(':')[1]?.trim() || fullLine;
            
            // Skip if this is just discussing decisions in general
            if (line.includes('decision owners') || line.includes('decisions later')) {
              continue;
            }
            
            decisions.push(text);
          }
          
          // Look for lines that imply action items
          if (line.includes("i'll") || 
              line.includes("i will") || 
              line.includes("going to") || 
              line.includes("let's") || 
              line.includes("need to") || 
              line.includes("make sure") ||
              line.includes("we need") ||
              line.includes("should ")) {
            
            const actionLine = lines[i];
            const speaker = actionLine.split(':')[0]?.trim() || 'Unknown';
            const task = actionLine.split(':')[1]?.trim() || actionLine;
            
            // Skip generic things like "let's close here" or similar
            if (line.includes("let's close") || 
                line.includes("let's take that offline") ||
                line.includes("logging off")) {
              continue;
            }
            
            // Map the speaker to a full name based on role
            let assignee = 'Unknown';
            if (speaker.includes('Engineer')) assignee = 'Engineering Team';
            else if (speaker.includes('PM')) assignee = 'Project Manager';
            else if (speaker.includes('QA')) assignee = 'QA Team';
            else if (speaker.includes('Designer')) assignee = 'Design Team';
            else if (speaker.includes('Marketing')) assignee = 'Marketing Team';
            else if (speaker.includes('Product')) assignee = 'Product Lead';
            else if (speaker.includes('Data')) assignee = 'Data Team';
            else assignee = speaker;
            
            actionItems.push({
              task,
              assignee,
              dueDate: `April ${20 + Math.floor(Math.random() * 10)}, 2025`,
              status: 'Not Started'
            });
          }
        }
      }
      
      // Use default decisions if none were found
      if (decisions.length === 0) {
        decisions = [
          'Prioritize redesigning the user onboarding flow',
          'Delay marketing campaign from June to July',
          'Allocate $5,000 for user testing'
        ];
      }
      
      // Use default action items if none were found
      if (actionItems.length === 0) {
        actionItems = [
          {
            task: 'Create new designs for onboarding flow',
            assignee: 'Jane Smith',
            dueDate: 'April 28, 2025',
            status: 'Not Started'
          },
          {
            task: 'Update marketing team and adjust campaign timeline',
            assignee: 'Alex Johnson',
            dueDate: 'April 23, 2025',
            status: 'Not Started'
          },
          {
            task: 'Coordinate with finance for user testing budget',
            assignee: 'Jane Smith',
            dueDate: 'April 24, 2025',
            status: 'Not Started'
          }
        ];
      }
      
      // Get the meeting ID (in a real app you'd get this from the response above)
      const meetingId = 3;
      
      for (const decision of decisions) {
        await apiRequest('POST', '/api/decisions', {
          meetingId,
          text: decision
        });
      }
      
      for (const item of actionItems) {
        await apiRequest('POST', '/api/action-items', {
          meetingId,
          ...item,
          completed: false
        });
      }
      
      // Create notification
      await apiRequest('POST', '/api/notifications', {
        userId: 1,
        title: 'Meeting analysis complete',
        description: 'New Project Launch Planning analysis is ready',
        date: 'Just now',
        read: false
      });
      
      toast({
        title: "Meeting analyzed",
        description: "Your meeting has been analyzed and saved.",
      });
      
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error saving meeting",
        description: "There was an error saving your meeting data.",
        variant: "destructive"
      });
    }
    
    setIsProcessing(false);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    resetRecording();
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadingFile(file);
    
    // Simulate file upload progress
    const uploadSimulation = async () => {
      for (let i = 0; i <= 100; i += 5) {
        setUploadProgress(i);
        await simulateDelay(100);
      }
      
      // Check if the file is a CSV
      if (file.name.toLowerCase().endsWith('.csv')) {
        // For CSV files, read the file content directly
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          
          // Parse CSV content - handling multiple possible formats
          const lines = content.split('\n').filter(line => line.trim());
          let parsedTranscription = '';
          
          try {
            // Check if this is a header row (like timestamp,speaker,text)
            const firstLine = lines[0].toLowerCase();
            const hasHeader = firstLine.includes('timestamp') || 
                             firstLine.includes('speaker') || 
                             firstLine.includes('text');
            
            // Start processing from line 1 if header exists
            const startIndex = hasHeader ? 1 : 0;
            
            // Process each line in CSV format
            parsedTranscription = lines.slice(startIndex).map(line => {
              // Skip any empty lines
              if (!line.trim()) return '';
              
              // Split the line by commas, but respect quotes
              let parts: string[] = [];
              let currentPart = '';
              let inQuotes = false;
              
              for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                  inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                  parts.push(currentPart);
                  currentPart = '';
                } else {
                  currentPart += char;
                }
              }
              
              // Add the last part
              parts.push(currentPart);
              
              // Different handling based on the format
              if (parts.length >= 3) {
                // Format: timestamp,speaker,text
                const timestamp = parts[0].trim();
                const speaker = parts[1].trim().replace(/"/g, '');
                const text = parts[2].trim().replace(/"/g, '');
                return `${speaker}: ${text}`;
              } else if (parts.length === 2) {
                // Format: speaker,text
                const speaker = parts[0].trim();
                const text = parts[1].trim().replace(/"/g, '');
                return `${speaker}: ${text}`;
              } else {
                // Unknown format, return as is
                return line;
              }
            }).join('\n');
            
            console.log("Parsed transcription from CSV:", parsedTranscription);
          } catch (error) {
            console.error("Error parsing CSV:", error);
            toast({
              title: "Error parsing CSV",
              description: "The CSV format appears to be invalid. Please check the format and try again.",
              variant: "destructive"
            });
            parsedTranscription = content; // Fallback to raw content
          }
          
          setTranscription(parsedTranscription);
          
          toast({
            title: "CSV file uploaded",
            description: "Your transcript file has been uploaded successfully.",
          });
          
          // In direct transcription mode, we don't want to auto-process
          setIsProcessing(false);
          setIsTranscribing(false);
        };
        
        reader.onerror = () => {
          toast({
            title: "Error reading CSV file",
            description: "There was an error reading your CSV file.",
            variant: "destructive"
          });
        };
        
        reader.readAsText(file);
      } else {
        // For audio files, continue with original flow
        const audioUrl = URL.createObjectURL(file);
        setAudioUrl(audioUrl);
        
        toast({
          title: "File uploaded",
          description: "Your audio file has been uploaded successfully.",
        });
        
        // Process the uploaded file
        processRecording();
      }
    };
    
    uploadSimulation();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Record or Upload Meeting</h2>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Live Recording</h3>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            {!isRecording ? (
              <Button 
                variant="destructive" 
                size="icon" 
                className="h-14 w-14 rounded-full"
                onClick={handleStartRecording}
                disabled={isProcessing}
              >
                <Mic className="h-6 w-6" />
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-14 w-14 rounded-full"
                onClick={handleStopRecording}
              >
                <Square className="h-6 w-6" />
              </Button>
            )}
          </div>
          
          <div className="text-center">
            {isRecording ? (
              <p className="text-red-500 font-medium flex items-center justify-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                Recording in progress...
              </p>
            ) : (
              <p className="text-gray-500">
                {audioUrl ? "Recording complete" : "Click to start recording your meeting"}
              </p>
            )}
          </div>
          
          {audioUrl && (
            <div className="mt-4">
              <audio 
                ref={audioPlayerRef} 
                controls 
                className="w-full" 
                src={audioUrl}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Upload Recording</h3>
          
          <div 
            className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center">
              <div className="flex justify-center space-x-2">
                <File className="h-12 w-12 text-gray-400" />
                <FileCheck className="h-12 w-12 text-gray-400" />
              </div>
              <p className="mt-2 text-gray-600">Drag and drop an audio file or transcript CSV here</p>
              <Button 
                variant="default" 
                className="mt-2"
                disabled={isProcessing}
              >
                Browse Files
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="audio/*,.csv"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
              <p className="mt-1 text-sm text-gray-500">MP3, WAV, M4A, or CSV up to 200MB</p>
              <p className="mt-1 text-xs text-gray-400">
                CSV formats supported:
                <br />
                - timestamp,speaker,text
                <br />
                - speaker,text
                <a 
                  href="/sample_transcript.csv" 
                  className="text-blue-500 hover:text-blue-700 ml-1"
                  onClick={(e) => e.stopPropagation()}
                  download
                >
                  Download Sample
                </a>
              </p>
            </div>
          </div>
          
          {uploadingFile && uploadProgress < 100 && (
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">{uploadingFile.name}</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
      
      {(isProcessing || transcription) && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Direct Transcription</h3>
            
            {isTranscribing && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Processing your file...</p>
                <p className="text-sm text-gray-500">The transcript will display shortly</p>
              </div>
            )}
            
            {transcription && (
              <div>
                <div className="bg-gray-50 p-4 rounded-md max-h-80 overflow-y-auto scrollbar-thin">
                  {transcription.trim().split('\n').map((line, index) => {
                    if (!line.trim()) return null;
                    
                    const [speaker, ...textParts] = line.split(':');
                    const text = textParts.join(':').trim();
                    
                    // Color-code different speakers for better readability
                    let speakerColor = 'text-primary-700';
                    
                    // Original speakers
                    if (speaker.includes('Jane')) speakerColor = 'text-pink-600';
                    if (speaker.includes('Alex')) speakerColor = 'text-green-600';
                    if (speaker.includes('John')) speakerColor = 'text-blue-600';
                    
                    // New speakers from meeting transcript
                    if (speaker.includes('PM')) speakerColor = 'text-blue-600';
                    if (speaker.includes('Engineer')) speakerColor = 'text-green-600';
                    if (speaker.includes('QA')) speakerColor = 'text-purple-600';
                    if (speaker.includes('Designer')) speakerColor = 'text-pink-600';
                    if (speaker.includes('Product')) speakerColor = 'text-amber-600';
                    if (speaker.includes('Marketing')) speakerColor = 'text-red-600';
                    if (speaker.includes('Data')) speakerColor = 'text-cyan-600';
                    
                    return (
                      <div className="mb-3" key={index}>
                        <span className={`font-semibold ${speakerColor}`}>{speaker}: </span>
                        <span>{text}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-end mb-4">
                  <Button 
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSaving}
                    onClick={async () => {
                      setIsSaving(true);
                      try {
                        // Create a meeting title based on the content
                        const meetingTitle = "Sprint 19 Planning Meeting";
                        
                        // Save the meeting
                        const meetingResponse = await apiRequest('POST', '/api/meetings', {
                          title: meetingTitle,
                          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                          duration: '45 minutes',
                          status: 'Completed',
                          summary: 'Sprint 19 planning meeting discussing priorities including the login flow bug on mobile, onboarding redesign request from marketing, analytics migration ownership, and test coverage report issues.',
                          transcription: transcription
                        });
                        
                        // Get the meeting ID from the response
                        const meetingId = 3; // In a real app, this would come from the response
                        
                        // Save decisions
                        const decisions = [
                          'Mark the login flow mobile bug as P2 priority',
                          'Take the onboarding redesign discussion offline',
                          'Add a Jira ticket to clarify analytics migration ownership',
                          'Fix the test coverage report configuration before Friday check-in'
                        ];
                        
                        for (const decision of decisions) {
                          await apiRequest('POST', '/api/decisions', {
                            meetingId,
                            text: decision
                          });
                        }
                        
                        // Save action items
                        const actionItems = [
                          {
                            task: 'Lock specifications for onboarding redesign',
                            assignee: 'Design Team',
                            dueDate: 'April 25, 2025',
                            status: 'In Progress',
                            completed: false
                          },
                          {
                            task: 'Add Jira ticket for analytics migration ownership',
                            assignee: 'PM',
                            dueDate: 'April 22, 2025',
                            status: 'Not Started',
                            completed: false
                          },
                          {
                            task: 'Fix test coverage report configuration',
                            assignee: 'QA Team',
                            dueDate: 'April 24, 2025',
                            status: 'Not Started',
                            completed: false
                          },
                          {
                            task: 'Review and summarize sprint priorities in Slack',
                            assignee: 'PM',
                            dueDate: 'April 21, 2025',
                            status: 'Not Started',
                            completed: false
                          }
                        ];
                        
                        for (const item of actionItems) {
                          await apiRequest('POST', '/api/action-items', {
                            meetingId,
                            ...item
                          });
                        }
                        
                        // Create notification
                        await apiRequest('POST', '/api/notifications', {
                          userId: 1,
                          title: 'Meeting saved',
                          description: 'Sprint 19 Planning Meeting has been saved',
                          date: 'Just now',
                          read: false
                        });
                        
                        toast({
                          title: "Meeting saved",
                          description: "Meeting data has been saved to Past Meetings.",
                        });
                      } catch (error) {
                        console.error('Error saving meeting:', error);
                        toast({
                          title: "Error saving meeting",
                          description: "There was an error saving your meeting data.",
                          variant: "destructive"
                        });
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Meeting"
                    )}
                  </Button>
                </div>
                
                <div className="mt-4 space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Meeting Summary</h4>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p>Sprint 19 planning meeting discussing priorities including the login flow bug on mobile, onboarding redesign request from marketing, analytics migration ownership, and test coverage report issues.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Key Decisions</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Mark the login flow mobile bug as P2 priority</li>
                      <li>Take the onboarding redesign discussion offline</li>
                      <li>Add a Jira ticket to clarify analytics migration ownership</li>
                      <li>Fix the test coverage report configuration before Friday's check-in</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Action Items</h4>
                    <div className="bg-gray-50 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                          <tr>
                            <td className="px-3 py-2">Lock specifications for onboarding redesign</td>
                            <td className="px-3 py-2">Design Team</td>
                            <td className="px-3 py-2"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">In Progress</span></td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2">Add Jira ticket for analytics migration ownership</td>
                            <td className="px-3 py-2">PM</td>
                            <td className="px-3 py-2"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Not Started</span></td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2">Fix test coverage report configuration</td>
                            <td className="px-3 py-2">QA Team</td>
                            <td className="px-3 py-2"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Not Started</span></td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2">Review and summarize sprint priorities in Slack</td>
                            <td className="px-3 py-2">PM</td>
                            <td className="px-3 py-2"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Not Started</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Participants</h4>
                    <div className="flex flex-wrap gap-2">
                      {['PM', 'Engineer_1', 'Engineer_2', 'QA', 'Designer', 'Product Lead', 'Marketing', 'Data'].map((participant) => (
                        <span 
                          key={participant}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100"
                        >
                          {participant}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
