import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div class="contact-page">
      <div class="page-hero">
        <div class="container">
          <h1>Contact Us</h1>
          <p>We're here to help. Reach out to us anytime.</p>
        </div>
      </div>
      <div class="container page-body">
        <div class="contact-grid">
          <div class="contact-info">
            <h2>Get In Touch</h2>
            <div class="contact-item"><mat-icon>phone</mat-icon><div><strong>Phone</strong><p>+966 11 XXX XXXX</p></div></div>
            <div class="contact-item"><mat-icon>email</mat-icon><div><strong>Email</strong><p>info&#64;capitallab.com</p></div></div>
            <div class="contact-item"><mat-icon>schedule</mat-icon><div><strong>Hours</strong><p>Sat–Thu: 7am–10pm</p></div></div>
          </div>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="contact-form">
            <h2>Send a Message</h2>
            <mat-form-field appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Subject</mat-label>
              <input matInput formControlName="subject" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Message</mat-label>
              <textarea matInput rows="5" formControlName="message"></textarea>
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page-hero { background: linear-gradient(135deg, #00796b, $secondary); color: white; padding: 80px 0;
      h1 { color: white; } p { color: rgba(255,255,255,0.85); }
    }
    .page-body { padding: 64px 0; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 64px;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .contact-item { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px;
      mat-icon { color: $primary; font-size: 24px; margin-top: 4px; }
      strong { display: block; margin-bottom: 4px; }
      p { margin: 0; color: $text-secondary; }
    }
    .contact-form { display: flex; flex-direction: column; gap: 4px; }
    .contact-form h2 { margin-bottom: 20px; }
    mat-form-field { width: 100%; }
  `]
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.toast.success('Message sent! We will get back to you shortly.');
      this.form.reset();
    }
  }
}
