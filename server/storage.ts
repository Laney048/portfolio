import { 
  users, type User, type InsertUser,
  meetings, type Meeting, type InsertMeeting,
  decisions, type Decision, type InsertDecision,
  actionItems, type ActionItem, type InsertActionItem,
  participants, type Participant, type InsertParticipant,
  notifications, type Notification, type InsertNotification,
  type MeetingWithDetails
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Meeting methods
  getMeeting(id: number): Promise<Meeting | undefined>;
  getMeetingWithDetails(id: number): Promise<MeetingWithDetails | undefined>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, meeting: Partial<InsertMeeting>): Promise<Meeting | undefined>;
  getAllMeetings(): Promise<Meeting[]>;
  getAllMeetingsWithDetails(): Promise<MeetingWithDetails[]>;

  // Decision methods
  getDecision(id: number): Promise<Decision | undefined>;
  getDecisionsByMeetingId(meetingId: number): Promise<Decision[]>;
  createDecision(decision: InsertDecision): Promise<Decision>;

  // Action Item methods
  getActionItem(id: number): Promise<ActionItem | undefined>;
  getActionItemsByMeetingId(meetingId: number): Promise<ActionItem[]>;
  getAllActionItems(): Promise<ActionItem[]>;
  createActionItem(actionItem: InsertActionItem): Promise<ActionItem>;
  updateActionItem(id: number, actionItem: Partial<InsertActionItem>): Promise<ActionItem | undefined>;

  // Participant methods
  getParticipantsByMeetingId(meetingId: number): Promise<Participant[]>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;

  // Notification methods
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  getAllNotifications(): Promise<Notification[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meetings: Map<number, Meeting>;
  private decisions: Map<number, Decision>;
  private actionItems: Map<number, ActionItem>;
  private participants: Map<number, Participant>;
  private notifications: Map<number, Notification>;
  
  private userCurrentId: number;
  private meetingCurrentId: number;
  private decisionCurrentId: number;
  private actionItemCurrentId: number;
  private participantCurrentId: number;
  private notificationCurrentId: number;

  constructor() {
    this.users = new Map();
    this.meetings = new Map();
    this.decisions = new Map();
    this.actionItems = new Map();
    this.participants = new Map();
    this.notifications = new Map();
    
    this.userCurrentId = 1;
    this.meetingCurrentId = 1;
    this.decisionCurrentId = 1;
    this.actionItemCurrentId = 1;
    this.participantCurrentId = 1;
    this.notificationCurrentId = 1;
    
    // Add some initial data
    this.initializeData();
  }

  // Initialize data for demo purposes
  private initializeData() {
    // Create sample users
    const john = this.createUser({
      username: "johndoe",
      password: "password123",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Product Manager",
      avatar: ""
    });

    const jane = this.createUser({
      username: "janesmith",
      password: "password123",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Product Designer",
      avatar: ""
    });

    const alex = this.createUser({
      username: "alexjohnson",
      password: "password123",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      role: "Marketing Lead",
      avatar: ""
    });

    // Create sample meetings
    const meeting1 = this.createMeeting({
      title: "Product Roadmap Discussion",
      date: "April 20, 2025",
      duration: "45 minutes",
      status: "Analyzed",
      summary: "The team discussed Q3 product roadmap priorities. Marketing needs were emphasized.",
      transcription: "",
      audioUrl: ""
    });

    this.createDecision({
      meetingId: meeting1.id,
      text: "Prioritize mobile app redesign for Q3"
    });

    this.createDecision({
      meetingId: meeting1.id,
      text: "Delay the API upgrade until Q4"
    });

    this.createDecision({
      meetingId: meeting1.id,
      text: "Approve budget for user research study"
    });

    this.createActionItem({
      meetingId: meeting1.id,
      task: "Create detailed spec for mobile redesign",
      assignee: "Jane Smith",
      dueDate: "April 30, 2025",
      status: "In Progress",
      completed: false
    });

    this.createActionItem({
      meetingId: meeting1.id,
      task: "Get vendor quotes for user research",
      assignee: "John Doe",
      dueDate: "April 25, 2025",
      status: "Completed",
      completed: true
    });

    this.createActionItem({
      meetingId: meeting1.id,
      task: "Update roadmap document",
      assignee: "Alex Johnson",
      dueDate: "April 23, 2025",
      status: "Not Started",
      completed: false
    });

    this.createParticipant({
      meetingId: meeting1.id,
      userId: john.id
    });

    this.createParticipant({
      meetingId: meeting1.id,
      userId: jane.id
    });

    this.createParticipant({
      meetingId: meeting1.id,
      userId: alex.id
    });

    const meeting2 = this.createMeeting({
      title: "Weekly Team Standup",
      date: "April 19, 2025",
      duration: "15 minutes",
      status: "Analyzed",
      summary: "Team members shared progress updates and blockers.",
      transcription: "",
      audioUrl: ""
    });

    this.createDecision({
      meetingId: meeting2.id,
      text: "Move daily standup to 9:30 AM starting next week"
    });

    this.createDecision({
      meetingId: meeting2.id,
      text: "Use new project tracking tool"
    });

    this.createActionItem({
      meetingId: meeting2.id,
      task: "Update calendar invites for new standup time",
      assignee: "Alex Johnson",
      dueDate: "April 22, 2025",
      status: "Not Started",
      completed: false
    });

    this.createActionItem({
      meetingId: meeting2.id,
      task: "Send out project tracking tool guidelines",
      assignee: "Jane Smith",
      dueDate: "April 23, 2025",
      status: "In Progress",
      completed: false
    });

    this.createParticipant({
      meetingId: meeting2.id,
      userId: john.id
    });

    this.createParticipant({
      meetingId: meeting2.id,
      userId: jane.id
    });

    this.createParticipant({
      meetingId: meeting2.id,
      userId: alex.id
    });
    
    // Sprint 19 Planning Meeting
    const meeting3 = this.createMeeting({
      title: "Sprint 19 Planning Meeting",
      date: "April 22, 2025",
      duration: "45 minutes",
      status: "Completed",
      summary: "Sprint 19 planning meeting discussing priorities including the login flow bug on mobile, onboarding redesign request from marketing, analytics migration ownership, and test coverage report issues.",
      transcription: "PM: Alright folks, we've got 45 minutes to lock the priorities for sprint 19.\nEngineer_1: Login flow is still breaking intermittently on mobile.\nQA: Yeah, it passed 4/5 tests this morning, but the last one failed due to timeout.\nPM: Noted. Should we mark it as a P1 or P2 for now?\nEngineer_2: If it's just timeout, might be a P2. Not critical.\nDesigner: Still waiting on final copy for the onboarding screens.\nProduct Lead: Onboarding redesign isn't on the roadmap this sprint, is it?\nPM: It's not officially in, but marketing asked for it again yesterday.\nMarketing: Yes — launch was supposed to be next week but they pushed. We could still make it.\nEngineer_1: If we're doing onboarding, we need specs locked today.\nPM: Let's take that offline. Back to dev priorities.\nEngineer_2: Still unclear who's owning the analytics migration.\nData: Was under the impression Product was leading that.\nProduct Lead: No, we passed that to Data last sprint.\nPM: Okay... let's add a Jira ticket to clarify ownership there.\nQA: The test coverage report is still broken. Fixed it twice but it keeps failing.\nEngineer_2: Let's fix that configuration before our Friday check-in.\nPM: Adding that to the list. Anything else?\nMarketing: Just need to know about onboarding.\nPM: We'll sync on that after this."
    });
    
    this.createDecision({
      meetingId: meeting3.id,
      text: "Mark the login flow mobile bug as P2 priority"
    });
    
    this.createDecision({
      meetingId: meeting3.id,
      text: "Take the onboarding redesign discussion offline"
    });
    
    this.createDecision({
      meetingId: meeting3.id,
      text: "Add a Jira ticket to clarify analytics migration ownership"
    });
    
    this.createDecision({
      meetingId: meeting3.id,
      text: "Fix the test coverage report configuration before Friday check-in"
    });
    
    this.createActionItem({
      meetingId: meeting3.id,
      task: "Lock specifications for onboarding redesign",
      assignee: "Design Team",
      dueDate: "April 25, 2025",
      status: "In Progress",
      completed: false
    });
    
    this.createActionItem({
      meetingId: meeting3.id,
      task: "Add Jira ticket for analytics migration ownership",
      assignee: "PM",
      dueDate: "April 22, 2025",
      status: "Not Started",
      completed: false
    });
    
    this.createActionItem({
      meetingId: meeting3.id,
      task: "Fix test coverage report configuration",
      assignee: "QA Team",
      dueDate: "April 24, 2025",
      status: "Not Started",
      completed: false
    });
    
    this.createActionItem({
      meetingId: meeting3.id,
      task: "Review and summarize sprint priorities in Slack",
      assignee: "PM",
      dueDate: "April 21, 2025",
      status: "Not Started",
      completed: false
    });
    
    // Add participants for Sprint 19 Planning Meeting
    this.createParticipant({
      meetingId: meeting3.id,
      name: "PM"
    });
    
    this.createParticipant({
      meetingId: meeting3.id,
      name: "Engineer_1"
    });
    
    this.createParticipant({
      meetingId: meeting3.id,
      name: "Engineer_2"
    });
    
    this.createParticipant({
      meetingId: meeting3.id,
      name: "QA"
    });
    
    this.createParticipant({
      meetingId: meeting3.id,
      name: "Designer"
    });
    
    this.createParticipant({
      meetingId: meeting3.id,
      name: "Product Lead"
    });
    
    this.createParticipant({
      meetingId: meeting3.id,
      name: "Marketing"
    });
    
    this.createParticipant({
      meetingId: meeting3.id,
      name: "Data"
    });

    // Create sample notifications
    this.createNotification({
      userId: jane.id,
      title: "New action item assigned",
      description: "Create detailed spec for mobile redesign",
      date: "Just now",
      read: false
    });

    this.createNotification({
      userId: john.id,
      title: "Meeting summary available",
      description: "Product Roadmap Discussion summary is ready",
      date: "2 hours ago",
      read: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Meeting methods
  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async getMeetingWithDetails(id: number): Promise<MeetingWithDetails | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;

    const decisions = await this.getDecisionsByMeetingId(id);
    const actionItems = await this.getActionItemsByMeetingId(id);
    const meetingParticipants = await this.getParticipantsByMeetingId(id);
    
    const participants = await Promise.all(
      meetingParticipants.map(async p => {
        const user = await this.getUser(p.userId);
        return user?.name || "";
      })
    );

    return {
      ...meeting,
      decisions,
      actionItems,
      participants: participants.filter(p => p !== "")
    };
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.meetingCurrentId++;
    const meeting: Meeting = { ...insertMeeting, id, createdAt: new Date() };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async updateMeeting(id: number, meeting: Partial<InsertMeeting>): Promise<Meeting | undefined> {
    const existingMeeting = this.meetings.get(id);
    if (!existingMeeting) return undefined;

    const updatedMeeting = { ...existingMeeting, ...meeting };
    this.meetings.set(id, updatedMeeting);
    return updatedMeeting;
  }

  async getAllMeetings(): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).sort((a, b) => {
      // Newest first (using createdAt, falling back to id if needed)
      const aDate = a.createdAt || new Date(0);
      const bDate = b.createdAt || new Date(0);
      return bDate.getTime() - aDate.getTime() || b.id - a.id;
    });
  }

  async getAllMeetingsWithDetails(): Promise<MeetingWithDetails[]> {
    const meetings = await this.getAllMeetings();
    return Promise.all(
      meetings.map(async meeting => {
        const details = await this.getMeetingWithDetails(meeting.id);
        return details!;
      })
    );
  }

  // Decision methods
  async getDecision(id: number): Promise<Decision | undefined> {
    return this.decisions.get(id);
  }

  async getDecisionsByMeetingId(meetingId: number): Promise<Decision[]> {
    return Array.from(this.decisions.values()).filter(
      (decision) => decision.meetingId === meetingId
    );
  }

  async createDecision(insertDecision: InsertDecision): Promise<Decision> {
    const id = this.decisionCurrentId++;
    const decision: Decision = { ...insertDecision, id };
    this.decisions.set(id, decision);
    return decision;
  }

  // Action Item methods
  async getActionItem(id: number): Promise<ActionItem | undefined> {
    return this.actionItems.get(id);
  }

  async getActionItemsByMeetingId(meetingId: number): Promise<ActionItem[]> {
    return Array.from(this.actionItems.values()).filter(
      (actionItem) => actionItem.meetingId === meetingId
    );
  }

  async getAllActionItems(): Promise<ActionItem[]> {
    return Array.from(this.actionItems.values());
  }

  async createActionItem(insertActionItem: InsertActionItem): Promise<ActionItem> {
    const id = this.actionItemCurrentId++;
    const actionItem: ActionItem = { ...insertActionItem, id };
    this.actionItems.set(id, actionItem);
    return actionItem;
  }

  async updateActionItem(id: number, actionItem: Partial<InsertActionItem>): Promise<ActionItem | undefined> {
    const existingActionItem = this.actionItems.get(id);
    if (!existingActionItem) return undefined;

    const updatedActionItem = { ...existingActionItem, ...actionItem };
    this.actionItems.set(id, updatedActionItem);
    return updatedActionItem;
  }

  // Participant methods
  async getParticipantsByMeetingId(meetingId: number): Promise<Participant[]> {
    return Array.from(this.participants.values()).filter(
      (participant) => participant.meetingId === meetingId
    );
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.participantCurrentId++;
    const participant: Participant = { ...insertParticipant, id };
    this.participants.set(id, participant);
    return participant;
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId
    ).sort((a, b) => {
      // Sort with newest first
      // Convert the date strings to something we can compare
      const dateA = a.date.includes("now") ? new Date() : 
                    a.date.includes("hours") ? new Date(Date.now() - Number(a.date.split(" ")[0]) * 60 * 60 * 1000) :
                    new Date();
      const dateB = b.date.includes("now") ? new Date() : 
                    b.date.includes("hours") ? new Date(Date.now() - Number(b.date.split(" ")[0]) * 60 * 60 * 1000) :
                    new Date();
      return dateB.getTime() - dateA.getTime();
    });
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationCurrentId++;
    const notification: Notification = { ...insertNotification, id };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;

    const updatedNotification: Notification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async getAllNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }
}

export const storage = new MemStorage();
