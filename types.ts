export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export type ClubAdminRole = 'president' | 'vice_president' | 'secretary' | 'treasurer' | 'member';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  address?: string;
  grade?: string;
  class?: string;
  department?: string; // For teachers
  position?: string; // For teachers
}

export interface ClubAdmin {
  userId: number;
  clubId: number;
  role: ClubAdminRole;
  assignedBy: number; // Who assigned this role
  assignedDate: string;
  isActive: boolean;
}

export interface ClubMembership {
  id: number;
  userId: number;
  clubId: number;
  role: ClubAdminRole;
  status: 'pending' | 'approved' | 'rejected';
  joinedDate?: string;
  applicationDate: string;
  approvedBy?: number;
  approvedDate?: string;
}

export interface Class {
  id: number;
  code: string;
  name: string;
  gradeLevel: number;
  academicYear: string;
  homeroomTeacherId?: number;
  studentCount: number;
  room?: string;
}

export interface Student {
  id: number;
  code: string;
  fullName: string;
  classId: number;
  dob: string;
  gender: 'Male' | 'Female';
  status: 'Active' | 'Inactive';
  email?: string;
  phone?: string;
}

export interface Teacher {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  major: string;
  avatar?: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  credits: number;
  color?: string;
}

export interface LMSMaterial {
  id: number;
  title: string;
  type: 'VIDEO' | 'ASSIGNMENT';
  subjectId: number;
  url?: string;
  deadline?: string;
  postedBy: string;
  date: string;
  description?: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface ScheduleItem {
  day: number;
  period: number;
  subjectId: number;
  teacherId: number;
  room?: string;
}

export interface Invoice {
  id: number;
  studentId: number;
  title: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  paymentDate?: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  cover?: string;
  status: 'AVAILABLE' | 'BORROWED';
  borrowedBy?: number;
}

export interface SchoolEvent {
  id: number;
  title: string;
  date: string;
  type: 'ACADEMIC' | 'HOLIDAY' | 'ACTIVITY';
  description: string;
}

export interface Exam {
  id: number;
  title: string;
  subjectId: number;
  date: string;
  duration: number;
  totalQuestions: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
}

export interface TransportRoute {
  id: number;
  name: string;
  driverName: string;
  driverPhone: string;
  licensePlate: string;
  capacity: number;
  studentCount: number;
  status: 'ON_ROUTE' | 'IDLE';
}

export interface Staff {
  id: number;
  fullName: string;
  role: string;
  department: string;
  status: 'Active' | 'On Leave';
  email: string;
  phone: string;
  salary: number;
}

export interface LeaveRequest {
  id: number;
  staffId: number;
  type: 'Sick' | 'Annual' | 'Personal';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface CanteenItem {
  id: number;
  name: string;
  price: number;
  category: 'Food' | 'Drink' | 'Snack';
  image: string;
  available: boolean;
  calories?: number;
  description?: string;
  ingredients?: string[];
  preparationTime?: number; // in minutes
}

export interface MealSchedule {
  id: number;
  timeSlot: 'Sáng' | 'Ra chơi sáng' | 'Trưa' | 'Ra chơi chiều' | 'Tối';
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  items: CanteenItem[];
  date: string; // YYYY-MM-DD format
  isActive: boolean;
}

export interface MenuItemForm {
  name: string;
  price: string;
  category: 'Food' | 'Drink' | 'Snack';
  calories: string;
  description: string;
  ingredients: string;
  preparationTime: string;
  image: string;
}

// Financial Management Types
export interface FinancialTransaction {
  id: number;
  type: 'income' | 'expense';
  category: 'revenue' | 'supplier_payment' | 'salary' | 'utilities' | 'maintenance' | 'other';
  amount: number;
  description: string;
  date: string;
  reference: string;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod: 'cash' | 'transfer' | 'qr';
  createdBy: string;
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  supplier: string;
  lastRestockDate: string;
  expiryDate?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  quantity?: number;
  location?: string;
  condition?: 'GOOD' | 'FAIR' | 'POOR' | 'MAINTENANCE';
}

export interface ProfitAnalysis {
  id: number;
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingItems: {
    itemId: number;
    itemName: string;
    quantity: number;
    revenue: number;
  }[];
  expenseBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface BudgetPlan {
  id: number;
  name: string;
  period: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  allocatedBudget: number;
  spentAmount: number;
  remainingBudget: number;
  categories: {
    category: string;
    allocated: number;
    spent: number;
    remaining: number;
  }[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categories: string[];
  paymentTerms: string;
  rating: number;
  status: 'active' | 'inactive';
}

// Club Management Types
export interface ClubMember {
  id: number;
  fullName: string;
  email: string;
  role: 'president' | 'vice_president' | 'secretary' | 'treasurer' | 'member';
  joinedDate: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  phone?: string;
  grade?: string;
  class?: string;
}

export interface ClubPost {
  id: number;
  title: string;
  content: string;
  type: 'announcement' | 'news' | 'discussion' | 'achievement';
  author: string;
  authorAvatar?: string;
  createdAt: string;
  likes: number;
  comments: number;
  images?: string[];
  clubId: number;
}

export interface ClubEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  registrationDeadline: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  clubId: number;
  createdAt: string;
}

export interface ExpenseReport {
  id: number;
  month: string;
  year: number;
  totalExpenses: number;
  expensesByCategory: {
    category: string;
    amount: number;
    transactions: number;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
  }[];
}

// Inventory Transaction Types
export interface InventoryTransaction {
  id: number;
  inventoryItemId: number;
  itemName: string;
  transactionType: 'in' | 'out';
  quantity: number;
  unitPrice: number;
  totalValue: number;
  reference: string;
  reason: string;
  date: string;
  time: string;
  createdBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  supplier?: string;
  expiryDate?: string;
  batchNumber?: string;
  notes?: string;
}

export interface InventoryReport {
  id: number;
  period: string;
  startDate: string;
  endDate: string;
  totalInTransactions: number;
  totalOutTransactions: number;
  totalValueIn: number;
  totalValueOut: number;
  netChange: number;
  topItems: {
    itemName: string;
    transactionCount: number;
    totalQuantity: number;
    totalValue: number;
  }[];
  transactionsByDate: {
    date: string;
    inCount: number;
    outCount: number;
    inValue: number;
    outValue: number;
  }[];
}

export interface DormRoom {
  id: number;
  name: string;
  type: 'Male' | 'Female';
  capacity: number;
  occupied: number;
  status: 'Available' | 'Full' | 'Maintenance';
  block: string;
}

export interface Alumnus {
  id: number;
  fullName: string;
  graduationYear: number;
  currentJob: string;
  company: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface MedicalRecord {
  id: number;
  studentId: number;
  condition: string;
  allergies: string;
  bloodType: string;
  lastCheckup: string;
  notes: string;
}

export interface HealthIncident {
  id: number;
  studentId: number;
  date: string;
  description: string;
  treatment: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Resolved' | 'Follow-up';
}

export interface Survey {
  id: number;
  title: string;
  deadline: string;
  participants: number;
  totalTarget: number;
  status: 'Active' | 'Closed';
  type: 'TeacherEval' | 'Facility' | 'General';
}

export interface FeedbackItem {
  id: number;
  senderName: string; // Often "Anonymous"
  category: string;
  content: string;
  date: string;
  status: 'New' | 'Read' | 'Replied';
}

export interface Applicant {
  id: number;
  code: string;
  fullName: string;
  dob: string;
  email: string;
  phone: string;
  gradeApplying: number;
  status: 'New' | 'Reviewing' | 'Interview' | 'Accepted' | 'Rejected';
  applicationDate: string;
  interviewDate?: string;
  score?: number;
}

export interface Club {
  id: number;
  name: string;
  category: 'Sports' | 'Arts' | 'Academic' | 'Social';
  presidentName: string;
  memberCount: number;
  description: string;
  image: string;
  meetingDay: string;
}

export interface ClubActivity {
  id: number;
  clubId: number;
  title: string;
  date: string;
  description: string;
}

export interface ResearchProject {
  id: number;
  title: string;
  field: string;
  leaderName: string;
  members: number; // Member count
  status: 'Proposal' | 'Approved' | 'Ongoing' | 'Completed';
  budget: number;
  startDate: string;
  progress: number; // 0-100
}

export interface CounselingSession {
  id: number;
  studentId: number;
  counselorName: string;
  date: string;
  time: string;
  type: 'Career' | 'Psychological' | 'Academic';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  room: string;
  notes?: string;
}

export interface PartnerUniversity {
  id: number;
  name: string;
  country: string;
  ranking: number;
  image: string;
  description: string;
  website: string;
}

export interface ExchangeProgram {
  id: number;
  partnerId: number;
  title: string;
  type: 'Semester Exchange' | 'Summer Camp' | 'Scholarship' | 'Research';
  duration: string;
  cost: number;
  deadline: string;
  slots: number;
}

export interface AbroadApplication {
  id: number;
  studentId: number;
  programId: number;
  status: 'Submitted' | 'Under Review' | 'Interview' | 'Accepted' | 'Rejected';
  submissionDate: string;
}

export interface IoTDevice {
  id: number;
  name: string;
  type: 'AC' | 'LIGHT' | 'PROJECTOR' | 'SENSOR';
  location: string;
  status: 'ON' | 'OFF';
  value?: string; // e.g. "26°C" for AC or sensor
  powerUsage: number; // Watts
}

export interface AIMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface SystemLog {
  id: number;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  module: string;
  message: string;
  latency?: number;
}

export interface ServerStats {
  cpu: number; // %
  memory: number; // %
  activeRequests: number;
  uptime: string;
  totalRequests: number;
  activeMicroservices: number;
}

// AI Specific Analysis Types
export interface AIAnalysisResult {
  title: string;
  summary: string;
  recommendations: string[];
  dataPoints?: { label: string; value: number | string }[];
}