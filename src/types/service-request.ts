// Service Request Management System Types

export type UserRole = 'admin' | 'hod' | 'technician' | 'requestor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  avatarUrl?: string;
}

export interface ServiceRequestStatus {
  id: string;
  name: string;
  systemName: string;
  sequence: number;
  description?: string;
  cssClass?: string;
  isOpen: boolean;
  isNoFurtherActionRequired: boolean;
  isAllowedForTechnician: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceDepartment {
  id: string;
  name: string;
  campusId: string;
  description?: string;
  ccEmailToCSV?: string;
  isRequestTitleDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceDeptPerson {
  id: string;
  departmentId: string;
  staffId: string;
  staffName: string;
  fromDate: Date;
  toDate?: Date;
  description?: string;
  isHOD: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  sequence: number;
  isForStaff: boolean;
  isForStudent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceRequestType {
  id: string;
  serviceTypeId: string;
  serviceTypeName?: string;
  departmentId: string;
  departmentName?: string;
  name: string;
  description?: string;
  sequence: number;
  requestTotal: number;
  requestPending: number;
  requestClosed: number;
  requestCancelled: number;
  isVisibleResource: boolean;
  defaultPriorityLevel?: 'High' | 'Medium' | 'Low';
  reminderDaysAfterAssignment?: number;
  isMandatoryResource: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceRequestTypeWisePerson {
  id: string;
  serviceRequestTypeId: string;
  serviceRequestTypeName?: string;
  staffId: string;
  staffName: string;
  fromDate?: Date;
  toDate?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ServiceRequest {
  id: string;
  requestNo: string;
  requestDateTime: Date;
  staffId?: string;
  staffName?: string;
  studentId?: string;
  studentName?: string;
  serviceRequestTypeId: string;
  serviceRequestTypeName: string;
  departmentId: string;
  departmentName: string;
  title: string;
  description: string;
  attachmentPaths: string[];
  statusId: string;
  statusName: string;
  statusDateTime?: Date;
  statusByUserId?: string;
  statusDescription?: string;
  approvalStatus?: ApprovalStatus;
  approvalStatusDateTime?: Date;
  approvalStatusByUserId?: string;
  approvalStatusDescription?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  assignedDateTime?: Date;
  assignedByUserId?: string;
  assignedDescription?: string;
  resourceId?: string;
  priorityLevel: PriorityLevel;
  onBehalfOfStaffId?: string;
  onBehalfOfStaffName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceRequestReply {
  id: string;
  serviceRequestId: string;
  staffId?: string;
  staffName?: string;
  studentId?: string;
  studentName?: string;
  replyDateTime: Date;
  replyDescription: string;
  attachmentPath?: string;
  statusId: string;
  statusName: string;
  statusDateTime: Date;
  statusByUserId: string;
  statusDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard stats
export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  closedRequests: number;
  avgResolutionTime: string;
}
