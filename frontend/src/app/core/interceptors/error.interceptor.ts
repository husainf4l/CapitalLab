import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { TokenStorageService } from '../services/token-storage.service';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const tokenStorage = inject(TokenStorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 400:
          toast.error(extractMessage(error, 'Invalid request. Please check your input.'));
          break;
        case 401:
          tokenStorage.clearTokens();
          toast.error(extractMessage(error, 'Session expired. Please log in again.'));
          if (!req.url.includes('/auth/login')) {
            router.navigate(['/login']);
          }
          break;
        case 403:
          toast.error('You do not have permission to perform this action.');
          router.navigate(['/']);
          break;
        case 404:
          toast.error(environment.production
            ? 'The requested resource was not found.'
            : `The requested resource was not found: ${req.url}`);
          break;
        case 500:
          toast.error('A server error occurred. Please try again later.');
          break;
        default:
          if (error.status === 0) {
            toast.error('Unable to connect to the server. Please check your connection.');
          }
      }
      return throwError(() => error);
    })
  );
};

function extractMessage(error: HttpErrorResponse, fallback: string): string {
  return error.error?.message ?? error.error?.errors?.[0] ?? fallback;
}
