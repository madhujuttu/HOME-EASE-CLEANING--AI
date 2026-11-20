const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:5000/api/v1';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('homeease_jwt_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('homeease_jwt_token', token);
    } else {
      localStorage.removeItem('homeease_jwt_token');
    }
  }

  public getToken(): string | null {
    return this.token || localStorage.getItem('homeease_jwt_token');
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();
    const currentRole = localStorage.getItem('homeease_role') || 'admin';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-role': currentRole,
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.warn(`[API] ${options.method || 'GET'} ${url} returned status ${response.status}:`, data);
        if (data && typeof data === 'object') {
          return data as T;
        }
        return { success: false, message: `Request failed with status ${response.status}` } as unknown as T;
      }

      return data as T;
    } catch (err: any) {
      console.warn(`[API Service] Remote API not reachable at ${url}: ${err.message}`);
      return { success: false, message: err.message || 'Remote database service unreachable.' } as unknown as T;
    }
  }

  // --- Auth Endpoints ---
  public async login(credentials: { email: string; password: string }) {
    const res = await this.request<{ success: boolean; token: string; user: any; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (res?.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async register(data: any) {
    const res = await this.request<{ success: boolean; token: string; user: any; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res?.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async sendPhoneOtp(phone: string) {
    return this.request<{ success: boolean; message: string; otp?: string; phone?: string }>('/auth/phone/otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  }

  public async loginWithPhone(payload: { phone: string; otp: string; name?: string }) {
    const res = await this.request<{ success: boolean; token: string; user: any; message?: string }>('/auth/phone/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res?.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async loginWithGoogle(payload: { email: string; name?: string; googleId?: string; avatar?: string }) {
    const res = await this.request<{ success: boolean; token: string; user: any; message?: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res?.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async getMe() {
    return this.request<{ success: boolean; user: any }>('/auth/me');
  }

  // --- Leads Endpoints ---
  public async getLeads(params?: { status?: string; priority?: string; source?: string; search?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ success: boolean; count: number; leads: any[]; message?: string }>(`/leads${qs}`);
  }

  public async createLead(leadData: any) {
    return this.request<{ success: boolean; lead: any; message?: string }>('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  }

  public async updateLead(id: string, updates: any) {
    return this.request<{ success: boolean; lead: any; message?: string }>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public async deleteLead(id: string) {
    return this.request<{ success: boolean; message?: string }>(`/leads/${id}`, {
      method: 'DELETE'
    });
  }

  public async assignLead(leadId: string, employeeId: string, reason?: string) {
    return this.request<{ success: boolean; lead: any; message?: string }>(`/leads/${leadId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ employeeId, reason })
    });
  }

  public async convertLead(leadId: string) {
    return this.request<{ success: boolean; customer: any; message?: string }>(`/leads/${leadId}/convert`, {
      method: 'POST'
    });
  }

  public async getLeadHistory(leadId: string) {
    return this.request<{
      success: boolean;
      lead: any;
      interactionHistory: any[];
      assignmentHistory: any[];
      auditHistory: any[];
      meetings: any[];
      followUps: any[];
      message?: string;
    }>(`/leads/${leadId}/history`);
  }

  public async addLeadNote(leadId: string, noteData: { summary: string; type?: string; sentiment?: string }) {
    return this.request<{ success: boolean; lead: any; message?: string }>(`/leads/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  }

  // --- Customers Endpoints ---
  public async getCustomers(params?: { tier?: string; search?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ success: boolean; count: number; customers: any[]; message?: string }>(`/customers${qs}`);
  }

  public async createCustomer(customerData: any) {
    return this.request<{ success: boolean; customer: any; message?: string }>('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  }

  public async addCustomerNote(customerId: string, note: string) {
    return this.request<{ success: boolean; customer: any; message?: string }>(`/customers/${customerId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note })
    });
  }

  // --- Meetings / Schedules Endpoints ---
  public async getMeetings(params?: { status?: string; employeeId?: string; search?: string; date?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ success: boolean; count: number; meetings: any[]; message?: string }>(`/meetings${qs}`);
  }

  public async createMeeting(meetingData: any) {
    return this.request<{ success: boolean; meeting: any; message?: string }>('/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData)
    });
  }

  public async updateMeeting(id: string, updates: any) {
    return this.request<{ success: boolean; meeting: any; message?: string }>(`/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public async cancelMeeting(id: string, reason?: string) {
    return this.request<{ success: boolean; meeting: any; message?: string }>(`/meetings/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
  }

  public async completeMeeting(id: string, outcomeData: {
    outcome: string;
    discussionSummary?: string;
    customerRequirements?: string[];
    objections?: string[];
    agreedActions?: string[];
    nextAction?: string;
    proofAttachment?: string;
  }) {
    return this.request<{ success: boolean; meeting: any; message?: string }>(`/meetings/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(outcomeData)
    });
  }

  public async rescheduleMeeting(id: string, dateTime: string, reason?: string, durationMinutes?: number) {
    return this.request<{ success: boolean; meeting: any; message?: string }>(`/meetings/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ dateTime, reason, durationMinutes })
    });
  }

  // --- Follow-Ups Endpoints ---
  public async getFollowUps(params?: {
    leadId?: string;
    employeeId?: string;
    status?: string;
    priority?: string;
    type?: string;
    date?: string;
    search?: string;
  }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ success: boolean; count: number; followUps: any[]; message?: string }>(`/follow-ups${qs}`);
  }

  public async getFollowUpById(id: string) {
    return this.request<{ success: boolean; followUp: any; message?: string }>(`/follow-ups/${id}`);
  }

  public async createFollowUp(followUpData: any) {
    return this.request<{ success: boolean; followUp: any; message?: string }>('/follow-ups', {
      method: 'POST',
      body: JSON.stringify(followUpData)
    });
  }

  public async updateFollowUp(id: string, updates: any) {
    return this.request<{ success: boolean; followUp: any; message?: string }>(`/follow-ups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public async rescheduleFollowUp(id: string, scheduledDateTime: string, reason?: string) {
    return this.request<{ success: boolean; followUp: any; message?: string }>(`/follow-ups/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduledDateTime, reason })
    });
  }

  public async completeFollowUp(id: string, outcomeData: {
    outcome: string;
    discussionSummary?: string;
    customerFeedback?: string;
    nextAction?: string;
    proofAttachment?: string;
    nextFollowUpDate?: string;
  }) {
    return this.request<{ success: boolean; followUp: any; message?: string }>(`/follow-ups/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(outcomeData)
    });
  }

  public async cancelFollowUp(id: string, reason?: string) {
    return this.request<{ success: boolean; followUp: any; message?: string }>(`/follow-ups/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
  }

  public async deleteFollowUp(id: string) {
    return this.request<{ success: boolean; message?: string }>(`/follow-ups/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Services & Categories Endpoints ---
  public async getServices(params?: { categoryId?: string; status?: string; search?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ success: boolean; count: number; services: any[]; message?: string }>(`/services${qs}`);
  }

  public async getCategories() {
    return this.request<{ success: boolean; count: number; categories: any[]; message?: string }>('/services/categories');
  }

  public async createService(serviceData: any) {
    return this.request<{ success: boolean; service: any; message?: string }>('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  }

  public async updateService(id: string, updates: any) {
    return this.request<{ success: boolean; service: any; message?: string }>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public async deleteService(id: string) {
    return this.request<{ success: boolean; service?: any; message?: string }>(`/services/${id}`, {
      method: 'DELETE'
    });
  }

  public async uploadServiceImage(file: File): Promise<{ success: boolean; imageUrl?: string; imageStorageKey?: string; message?: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const url = `${API_BASE_URL}/services/upload-image`;
    const token = this.getToken();
    const headers: Record<string, string> = {
      'x-user-role': localStorage.getItem('homeease_role') || 'admin'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Image upload failed.' };
    }
  }

  // --- Providers & Bookings ---
  public async getProviders(params?: { status?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ success: boolean; count: number; providers: any[]; message?: string }>(`/providers${qs}`);
  }

  public async getBookings(params?: { status?: string; customerPhone?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ success: boolean; count: number; bookings: any[]; message?: string }>(`/bookings${qs}`);
  }

  public async createBooking(bookingData: any) {
    return this.request<{ success: boolean; booking: any; message?: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  public async updateBookingStatus(id: string, status: string, providerId?: string) {
    return this.request<{ success: boolean; booking: any; message?: string }>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, providerId })
    });
  }

  public async addBookingReview(id: string, reviewData: { rating: number; comment?: string; images?: string[] }) {
    return this.request<{ success: boolean; booking: any; message?: string }>(`/bookings/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  public async respondBooking(id: string, action: 'accept' | 'reject', providerId: string, reason?: string) {
    return this.request<{ success: boolean; booking: any; message?: string }>(`/bookings/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action, providerId, reason })
    });
  }

  public async createProvider(providerData: any) {
    return this.request<{ success: boolean; provider: any; message?: string }>('/providers', {
      method: 'POST',
      body: JSON.stringify(providerData)
    });
  }

  public async updateProvider(id: string, updates: any) {
    return this.request<{ success: boolean; provider: any; message?: string }>(`/providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // --- Payments ---
  public async getPayments(params?: { status?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ success: boolean; count: number; payments: any[]; message?: string }>(`/payments${qs}`);
  }

  public async createPayment(paymentData: any) {
    return this.request<{ success: boolean; payment: any; message?: string }>('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  public async updatePaymentStatus(id: string, status: string) {
    return this.request<{ success: boolean; payment: any; message?: string }>(`/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // --- Calls ---
  public async getCallLogs(params?: { type?: string; status?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ success: boolean; count: number; callLogs: any[]; message?: string }>(`/calls${qs}`);
  }

  public async createCallLog(callData: any) {
    return this.request<{ success: boolean; callLog: any; message?: string }>('/calls', {
      method: 'POST',
      body: JSON.stringify(callData)
    });
  }

  // --- AI Intelligence & Copilot ---
  public async queryCopilot(query: string) {
    return this.request<{ success: boolean; answer: string; actionCard?: { title: string; items: string[] } }>('/ai/copilot', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  public async queryCustomerAssistant(query: string) {
    return this.request<{ success: boolean; answer: string; serviceCard?: any }>('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  public async scoreLead(payload: any) {
    return this.request<{ success: boolean; evaluation: { score: number; conversionProb: number; reason: string } }>('/ai/score', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async getAIInsights() {
    return this.request<{ success: boolean; count: number; insights: any[] }>('/ai/insights');
  }

  // --- Employees / Sales Team ---
  public async getEmployees() {
    return this.request<{ success: boolean; count: number; employees: any[]; message?: string }>('/sales/employees');
  }

  public async createEmployee(data: any) {
    return this.request<{ success: boolean; employee: any; message?: string }>('/sales/employees', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- Notifications ---
  public async getNotifications() {
    return this.request<{ success: boolean; count: number; notifications: any[]; message?: string }>('/notifications');
  }

  public async markNotificationRead(id: string) {
    return this.request<{ success: boolean; message?: string }>(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }

  public async markAllNotificationsRead() {
    return this.request<{ success: boolean; message?: string }>('/notifications/mark-all-read', {
      method: 'PATCH'
    });
  }

  public async getExecutiveReport() {
    return this.request<{ success: boolean; report: any }>('/notifications/report');
  }
}

export const api = new ApiClient();
