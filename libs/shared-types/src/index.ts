// Shared Types for FormSync
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormData {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  responses: FormResponse[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
  order: number;
}

export interface FormResponse {
  id: string;
  formId: string;
  responses: FieldResponse[];
  submittedAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface FieldResponse {
  fieldId: string;
  value: string | string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Extension Types
export interface ExtensionMessage {
  type: 'CAPTURE_FORM' | 'FILL_FORM' | 'GET_FORMS';
  payload?: any;
}

export interface CapturedForm {
  url: string;
  title: string;
  fields: CapturedField[];
  timestamp: Date;
}

export interface CapturedField {
  name: string;
  type: string;
  label?: string;
  placeholder?: string;
  required: boolean;
  value?: string;
}

