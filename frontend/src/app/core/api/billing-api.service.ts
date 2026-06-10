import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice, InvoiceSummary, Payment, CreateInvoiceRequest, RecordPaymentRequest } from '../models/billing.models';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private http = inject(HttpClient);
  private invoiceUrl = `${environment.apiUrl}/invoices`;
  private paymentUrl = `${environment.apiUrl}/payments`;

  // ── Invoices ─────────────────────────────────────────────────────────────
  getInvoices(params?: { branchId?: string; patientId?: string; status?: string; search?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<InvoiceSummary>>> {
    let p = new HttpParams();
    if (params?.branchId) p = p.set('branchId', params.branchId);
    if (params?.patientId) p = p.set('patientId', params.patientId);
    if (params?.status) p = p.set('status', params.status);
    if (params?.search) p = p.set('search', params.search);
    if (params?.page) p = p.set('page', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<InvoiceSummary>>>(this.invoiceUrl, { params: p });
  }

  getInvoice(id: string): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${this.invoiceUrl}/${id}`);
  }

  createInvoice(data: CreateInvoiceRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.invoiceUrl, data);
  }

  createFromOrder(testOrderId: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.invoiceUrl}/from-order/${testOrderId}`, {});
  }

  cancelInvoice(id: string, reason?: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.invoiceUrl}/${id}/cancel`, { reason });
  }

  refundInvoice(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.invoiceUrl}/${id}/refund`, {});
  }

  getPatientInvoices(patientId: string): Observable<ApiResponse<InvoiceSummary[]>> {
    return this.http.get<ApiResponse<InvoiceSummary[]>>(this.invoiceUrl, { params: new HttpParams().set('patientId', patientId) }) as any;
  }

  // ── Payments ─────────────────────────────────────────────────────────────
  getPayments(params?: { branchId?: string; invoiceId?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<Payment>>> {
    let p = new HttpParams();
    if (params?.branchId) p = p.set('branchId', params.branchId);
    if (params?.invoiceId) p = p.set('invoiceId', params.invoiceId);
    if (params?.page) p = p.set('page', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<Payment>>>(this.paymentUrl, { params: p });
  }

  getPayment(id: string): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${this.paymentUrl}/${id}`);
  }

  recordPayment(data: RecordPaymentRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.paymentUrl, data);
  }

  refundPayment(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.paymentUrl}/${id}/refund`, {});
  }

  getPatientPayments(patientId: string): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${environment.apiUrl}/patients/${patientId}/payments`);
  }
}
