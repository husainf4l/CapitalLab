import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabTestApiService } from '../../../core/api/lab-test-api.service';
import { PackageApiService } from '../../../core/api/package-api.service';
import { BranchApiService } from '../../../core/api/branch-api.service';
import { AppointmentApiService } from '../../../core/api/appointment-api.service';
import { HomeCollectionApiService } from '../../../core/api/home-collection-api.service';
import { LabTest, TestCategory } from '../../../core/models/lab-test.models';
import { HealthPackage } from '../../../core/models/health-package.models';
import { Branch } from '../../../core/models/branch.models';
import { BookingStore } from '../stores/booking.store';
import { FamilyMembersStore } from '../stores/family-members.store';
import { CurrentPatientContextService } from '../../../core/services/current-patient-context.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [
    RouterLink, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, CommonModule, FormsModule,
  ],
  template: `
    <div class="book-page">
      <!-- Success screen -->
      @if (bookingComplete()) {
        <div class="success-screen">
          <div class="success-card">
            <div class="success-icon">✅</div>
            <h2>Booking Confirmed!</h2>
            <p class="success-sub">Your appointment has been successfully booked.</p>
            <div class="success-summary">
              <div class="ss-row">
                <span class="ss-label">Type</span>
                <span class="ss-val">{{ store.appointmentType() === 'branch' ? 'Branch Visit' : 'Home Collection' }}</span>
              </div>
              @if (store.appointmentType() === 'branch' && store.selectedBranch()) {
                <div class="ss-row">
                  <span class="ss-label">Branch</span>
                  <span class="ss-val">{{ store.selectedBranch()!.name }}</span>
                </div>
              } @else if (store.appointmentType() === 'home_collection') {
                <div class="ss-row">
                  <span class="ss-label">Address</span>
                  <span class="ss-val">{{ store.address() }}, {{ store.city() }}</span>
                </div>
              }
              <div class="ss-row">
                <span class="ss-label">Date</span>
                <span class="ss-val">{{ store.appointmentDate() | date:'fullDate' }}</span>
              </div>
              <div class="ss-row">
                <span class="ss-label">Time</span>
                <span class="ss-val">{{ store.appointmentTime() }}</span>
              </div>
              <div class="ss-row">
                <span class="ss-label">Tests</span>
                <span class="ss-val">{{ store.selectionCount() }} selected</span>
              </div>
              <div class="ss-row total-row">
                <span class="ss-label">Total</span>
                <span class="ss-val price">{{ store.totalPrice() | currency:'SAR':'symbol':'1.0-0' }}</span>
              </div>
            </div>
            <div class="success-actions">
              <a mat-flat-button color="primary" routerLink="/patient/appointments">View Appointments</a>
              <a mat-stroked-button routerLink="/patient/dashboard">Back to Dashboard</a>
            </div>
          </div>
        </div>

      } @else {
        <!-- Progress bar -->
        <div class="progress-header">
          <a mat-icon-button routerLink="/patient/dashboard" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <div class="progress-title">
            <h3>Book Appointment</h3>
            <span class="step-label">Step {{ store.currentStep() }} of {{ store.totalSteps }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="(store.currentStep() / store.totalSteps) * 100"></div>
          </div>
          <div class="step-dots">
            @for (s of stepNumbers; track s) {
              <div class="step-dot" [class.done]="store.currentStep() > s" [class.active]="store.currentStep() === s">
                @if (store.currentStep() > s) { <mat-icon>check</mat-icon> }
                @else { {{ s }} }
              </div>
            }
          </div>
        </div>

        <!-- Step content -->
        <div class="step-content">

          <!-- Step 1: Choose Type -->
          @if (store.currentStep() === 1) {
            <div class="step-panel">
              <h4 class="step-title">How would you like your sample collected?</h4>
              <div class="type-cards">
                <div class="type-card" [class.selected]="store.appointmentType() === 'branch'"
                     (click)="store.appointmentType.set('branch')">
                  <div class="tc-icon">🏥</div>
                  <h4>Branch Visit</h4>
                  <p>Visit one of our modern labs near you</p>
                  <ul>
                    <li>Wider test availability</li>
                    <li>Results in 2–4 hours</li>
                    <li>Walk-in or scheduled</li>
                  </ul>
                  @if (store.appointmentType() === 'branch') {
                    <div class="tc-check">✓</div>
                  }
                </div>
                <div class="type-card" [class.selected]="store.appointmentType() === 'home_collection'"
                     (click)="store.appointmentType.set('home_collection')">
                  <div class="tc-icon">🏠</div>
                  <h4>Home Collection</h4>
                  <p>A trained technician comes to your door</p>
                  <ul>
                    <li>Convenient & safe</li>
                    <li>Same-day booking</li>
                    <li>SAR 30 collection fee</li>
                  </ul>
                  @if (store.appointmentType() === 'home_collection') {
                    <div class="tc-check">✓</div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Step 2: Select Tests / Packages -->
          @if (store.currentStep() === 2) {
            <div class="step-panel step-tests">
              <h4 class="step-title">What tests do you need?</h4>

              <!-- Sub-tabs -->
              <div class="sub-tabs">
                <button class="sub-tab" [class.active]="selectionTab() === 'tests'" (click)="selectionTab.set('tests')">
                  Tests
                </button>
                <button class="sub-tab" [class.active]="selectionTab() === 'packages'" (click)="selectionTab.set('packages')">
                  Packages
                </button>
              </div>

              @if (selectionTab() === 'tests') {
                <!-- Search + category filter -->
                <div class="test-filters">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Search tests</mat-label>
                    <mat-icon matPrefix>search</mat-icon>
                    <input matInput [(ngModel)]="testSearch" (ngModelChange)="onTestSearch($event)" placeholder="e.g. Vitamin D, CBC…" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="cat-field">
                    <mat-label>Category</mat-label>
                    <mat-select [(ngModel)]="selectedCategoryId" (ngModelChange)="loadTests()">
                      <mat-option value="">All</mat-option>
                      @for (cat of categories(); track cat.id) {
                        <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="items-list">
                  @if (testsLoading()) {
                    @for (i of [1,2,3,4]; track i) {
                      <div class="skel item-skel"></div>
                    }
                  } @else if (tests().length === 0) {
                    <p class="no-items">No tests found. Try a different search.</p>
                  } @else {
                    @for (test of tests(); track test.id) {
                      <div class="item-row" [class.selected]="store.isTestSelected(test.id)"
                           (click)="store.toggleTest(test)">
                        <div class="item-info">
                          <span class="item-name">{{ test.name }}</span>
                          <span class="item-meta">{{ test.code }} · {{ test.turnaroundTime }}</span>
                        </div>
                        <div class="item-right">
                          <span class="item-price">SAR {{ test.price }}</span>
                          <div class="add-btn" [class.added]="store.isTestSelected(test.id)">
                            <mat-icon>{{ store.isTestSelected(test.id) ? 'check' : 'add' }}</mat-icon>
                          </div>
                        </div>
                      </div>
                    }
                  }
                </div>
              } @else {
                <!-- Packages -->
                <div class="items-list">
                  @if (packagesLoading()) {
                    @for (i of [1,2,3]; track i) {
                      <div class="skel item-skel"></div>
                    }
                  } @else if (packages().length === 0) {
                    <p class="no-items">No packages available.</p>
                  } @else {
                    @for (pkg of packages(); track pkg.id) {
                      <div class="item-row pkg-row" [class.selected]="store.isPackageSelected(pkg.id)"
                           (click)="store.togglePackage(pkg)">
                        <div class="item-info">
                          <span class="item-name">{{ pkg.name }}</span>
                          <span class="item-meta">{{ pkg.tests?.length ?? pkg.testsCount ?? 0 }} tests included</span>
                        </div>
                        <div class="item-right">
                          <span class="item-price">SAR {{ pkg.price }}</span>
                          <div class="add-btn" [class.added]="store.isPackageSelected(pkg.id)">
                            <mat-icon>{{ store.isPackageSelected(pkg.id) ? 'check' : 'add' }}</mat-icon>
                          </div>
                        </div>
                      </div>
                    }
                  }
                </div>
              }

              <!-- Basket summary -->
              @if (store.selectionCount() > 0) {
                <div class="basket-bar">
                  <span>{{ store.selectionCount() }} selected · <strong>SAR {{ store.totalPrice() }}</strong></span>
                  <span class="basket-hint">Continue to next step</span>
                </div>
              }
            </div>
          }

          <!-- Step 3: Location -->
          @if (store.currentStep() === 3) {
            <div class="step-panel">
              @if (store.appointmentType() === 'branch') {
                <h4 class="step-title">Choose your branch</h4>
                @if (branchesLoading()) {
                  <div class="branch-grid">
                    @for (i of [1,2,3]; track i) {
                      <div class="skel branch-skel"></div>
                    }
                  </div>
                } @else {
                  <div class="branch-grid">
                    @for (branch of branches(); track branch.id) {
                      <div class="branch-card" [class.selected]="store.selectedBranch()?.id === branch.id"
                           (click)="store.selectedBranch.set(branch)">
                        @if (store.selectedBranch()?.id === branch.id) {
                          <div class="bc-check">✓</div>
                        }
                        <div class="bc-icon">🏥</div>
                        <h5>{{ branch.name }}</h5>
                        <p class="bc-address">{{ branch.address }}</p>
                        <p class="bc-city">{{ branch.city }}</p>
                        <p class="bc-phone">{{ branch.phone }}</p>
                      </div>
                    }
                  </div>
                }
              } @else {
                <h4 class="step-title">Enter your collection address</h4>
                <div class="address-form">
                  <mat-form-field appearance="outline" class="full-field">
                    <mat-label>Street Address</mat-label>
                    <input matInput [ngModel]="store.address()" (ngModelChange)="store.address.set($event)" placeholder="Building, street, district" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-field">
                    <mat-label>City</mat-label>
                    <mat-select [ngModel]="store.city()" (ngModelChange)="store.city.set($event)">
                      @for (city of cities; track city) {
                        <mat-option [value]="city">{{ city }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <div class="hc-note">
                    <mat-icon>info</mat-icon>
                    <p>A collection fee of SAR 30 will be added. Our technician will arrive within the selected time window.</p>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Step 4: Date & Time -->
          @if (store.currentStep() === 4) {
            <div class="step-panel">
              <h4 class="step-title">Select date and time</h4>
              <mat-form-field appearance="outline" class="date-field">
                <mat-label>Appointment Date</mat-label>
                <input matInput type="date" [ngModel]="store.appointmentDate()"
                       (ngModelChange)="store.appointmentDate.set($event)" [min]="today" />
              </mat-form-field>
              <h5 class="slots-title">Available Time Slots</h5>
              <div class="time-slots-grid">
                @for (slot of timeSlots; track slot) {
                  <button class="ts-btn" [class.selected]="store.appointmentTime() === slot"
                          (click)="store.appointmentTime.set(slot)">
                    {{ slot }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- Step 5: Patient -->
          @if (store.currentStep() === 5) {
            <div class="step-panel">
              <h4 class="step-title">Who is this appointment for?</h4>
              <div class="patient-cards">
                <!-- Self -->
                <div class="patient-card"
                     [class.selected]="store.selectedPatient()?.isSelf"
                     (click)="selectSelf()">
                  <div class="pc-avatar self">{{ ctx.initials() || '?' }}</div>
                  <div class="pc-info">
                    <strong>Myself</strong>
                    <span>{{ ctx.fullName() || 'Loading…' }}</span>
                  </div>
                  @if (store.selectedPatient()?.isSelf) {
                    <div class="pc-check">✓</div>
                  }
                </div>

                <!-- Family members -->
                @for (member of familyStore.members(); track member.id) {
                  <div class="patient-card"
                       [class.selected]="store.selectedPatient()?.id === member.id && !store.selectedPatient()?.isSelf"
                       (click)="selectMember(member)">
                    <div class="pc-avatar" [class]="'gender-' + member.gender">{{ member.firstName.charAt(0) }}</div>
                    <div class="pc-info">
                      <strong>{{ member.fullName }}</strong>
                      <span>{{ member.relationship | titlecase }}</span>
                    </div>
                    @if (store.selectedPatient()?.id === member.id && !store.selectedPatient()?.isSelf) {
                      <div class="pc-check">✓</div>
                    }
                  </div>
                }

                @if (familyStore.members().length === 0 && !familyStore.isLoading()) {
                  <p class="no-family">No family members added yet. You can add them in the <a routerLink="/patient/family-members">Family Members</a> section.</p>
                }
              </div>
            </div>
          }

          <!-- Step 6: Review & Confirm -->
          @if (store.currentStep() === 6) {
            <div class="step-panel">
              <h4 class="step-title">Review your booking</h4>
              <div class="review-card">
                <div class="review-section">
                  <div class="review-row">
                    <span class="rv-label">Type</span>
                    <span class="rv-val">{{ store.appointmentType() === 'branch' ? '🏥 Branch Visit' : '🏠 Home Collection' }}</span>
                  </div>
                  @if (store.appointmentType() === 'branch' && store.selectedBranch()) {
                    <div class="review-row">
                      <span class="rv-label">Branch</span>
                      <span class="rv-val">{{ store.selectedBranch()!.name }}, {{ store.selectedBranch()!.city }}</span>
                    </div>
                  } @else if (store.appointmentType() === 'home_collection') {
                    <div class="review-row">
                      <span class="rv-label">Address</span>
                      <span class="rv-val">{{ store.address() }}, {{ store.city() }}</span>
                    </div>
                  }
                  <div class="review-row">
                    <span class="rv-label">Date & Time</span>
                    <span class="rv-val">{{ store.appointmentDate() | date:'mediumDate' }} at {{ store.appointmentTime() }}</span>
                  </div>
                  <div class="review-row">
                    <span class="rv-label">Patient</span>
                    <span class="rv-val">{{ store.selectedPatient()?.name }}</span>
                  </div>
                </div>

                <div class="review-section">
                  <h5>Selected Tests & Packages</h5>
                  @for (t of store.selectedTests(); track t.id) {
                    <div class="item-review-row">
                      <span>{{ t.name }}</span>
                      <span>SAR {{ t.price }}</span>
                    </div>
                  }
                  @for (p of store.selectedPackages(); track p.id) {
                    <div class="item-review-row pkg">
                      <span>📦 {{ p.name }}</span>
                      <span>SAR {{ p.price }}</span>
                    </div>
                  }
                  <div class="total-row">
                    <span>Total</span>
                    <span class="total-price">SAR {{ store.totalPrice() }}</span>
                  </div>
                </div>

                <mat-form-field appearance="outline" class="full-field">
                  <mat-label>Notes (optional)</mat-label>
                  <textarea matInput rows="2" [ngModel]="store.notes()" (ngModelChange)="store.notes.set($event)"
                            placeholder="Any special instructions or preparation notes…"></textarea>
                </mat-form-field>
              </div>
            </div>
          }

        </div>

        <!-- Navigation footer -->
        <div class="wizard-footer">
          @if (store.currentStep() > 1) {
            <button mat-stroked-button (click)="store.prevStep()">
              <mat-icon>arrow_back</mat-icon> Back
            </button>
          } @else {
            <div></div>
          }

          @if (store.currentStep() < store.totalSteps) {
            <button mat-flat-button color="primary"
                    [disabled]="!store.isCurrentStepValid()"
                    (click)="store.nextStep()">
              Next <mat-icon>arrow_forward</mat-icon>
            </button>
          } @else {
            <button mat-flat-button color="primary"
                    [disabled]="store.isSubmitting() || !store.isCurrentStepValid()"
                    (click)="submit()">
              @if (store.isSubmitting()) {
                <mat-icon class="spin">refresh</mat-icon> Booking…
              } @else {
                <mat-icon>check_circle</mat-icon> Confirm Booking
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .book-page { max-width: 720px; margin: 0 auto; }

    /* Progress header */
    .progress-header { background: white; border-radius: $border-radius-lg; padding: 20px 24px; box-shadow: $shadow-sm; border: 1px solid $border-color; margin-bottom: 20px; }
    .back-btn { margin-bottom: 8px; }
    .progress-title { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;
      h3 { margin: 0; font-size: 1.1rem; }
      .step-label { font-size: 0.8rem; color: $text-secondary; }
    }
    .progress-bar { height: 4px; background: $gray-100; border-radius: 2px; margin-bottom: 16px; overflow: hidden; }
    .progress-fill { height: 100%; background: $primary; border-radius: 2px; transition: width 0.3s; }
    .step-dots { display: flex; gap: 8px; }
    .step-dot {
      width: 28px; height: 28px; border-radius: 50%; border: 2px solid $border-color;
      display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600;
      color: $text-secondary; transition: all 0.2s;
      &.active { border-color: $primary; background: $primary; color: white; }
      &.done { border-color: $success; background: $success; color: white; mat-icon { font-size: 14px; } }
    }

    /* Step panels */
    .step-content { background: white; border-radius: $border-radius-lg; padding: 28px; box-shadow: $shadow-sm; border: 1px solid $border-color; margin-bottom: 16px; min-height: 320px; }
    .step-title { margin: 0 0 24px; font-size: 1.1rem; font-weight: 600; }
    .step-panel { display: flex; flex-direction: column; }

    /* Type cards */
    .type-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      @media (max-width: 576px) { grid-template-columns: 1fr; }
    }
    .type-card {
      border: 2px solid $border-color; border-radius: $border-radius-lg; padding: 24px;
      cursor: pointer; position: relative; transition: all 0.2s;
      &:hover { border-color: $primary; background: $primary-light; }
      &.selected { border-color: $primary; background: $primary-light; }
      .tc-icon { font-size: 2.5rem; margin-bottom: 12px; }
      h4 { margin: 0 0 8px; }
      p { color: $text-secondary; font-size: 0.875rem; margin: 0 0 12px; }
      ul { margin: 0; padding-left: 18px; color: $text-secondary; font-size: 0.8rem; li { margin-bottom: 4px; } }
      .tc-check { position: absolute; top: 12px; right: 12px; width: 24px; height: 24px; border-radius: 50%; background: $primary; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; }
    }

    /* Tests step */
    .sub-tabs { display: flex; gap: 4px; border-bottom: 1px solid $border-color; margin-bottom: 20px; }
    .sub-tab { padding: 8px 20px; border: none; background: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; color: $text-secondary; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s;
      &.active { color: $primary; border-bottom-color: $primary; }
    }
    .test-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;
      .search-field { flex: 1; min-width: 180px; }
      .cat-field { min-width: 140px; }
    }
    .items-list { display: flex; flex-direction: column; gap: 6px; max-height: 320px; overflow-y: auto; }
    .item-row {
      display: flex; align-items: center; gap: 12px; padding: 12px 14px;
      border: 1.5px solid $border-color; border-radius: $border-radius; cursor: pointer; transition: all 0.15s;
      &:hover { border-color: $primary; background: $primary-light; }
      &.selected { border-color: $primary; background: $primary-light; }
    }
    .item-info { flex: 1; .item-name { display: block; font-weight: 500; font-size: 0.9rem; } .item-meta { font-size: 0.75rem; color: $text-secondary; } }
    .item-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .item-price { font-size: 0.875rem; font-weight: 600; color: $primary; }
    .add-btn { width: 28px; height: 28px; border-radius: 50%; background: $gray-100; display: flex; align-items: center; justify-content: center; transition: all 0.15s; mat-icon { font-size: 16px; } &.added { background: $primary; color: white; } }
    .basket-bar { margin-top: 16px; padding: 12px 16px; background: $primary-light; border: 1px solid $primary; border-radius: $border-radius; display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; .basket-hint { color: $primary; font-size: 0.8rem; } }
    .no-items { text-align: center; color: $text-secondary; font-size: 0.875rem; padding: 24px 0; }

    /* Branch */
    .branch-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
      @media (max-width: 576px) { grid-template-columns: 1fr; }
    }
    .branch-card {
      border: 2px solid $border-color; border-radius: $border-radius; padding: 16px;
      cursor: pointer; position: relative; transition: all 0.15s;
      &:hover { border-color: $primary; }
      &.selected { border-color: $primary; background: $primary-light; }
      .bc-icon { font-size: 1.5rem; margin-bottom: 8px; }
      h5 { margin: 0 0 4px; font-size: 0.9rem; }
      .bc-address, .bc-city, .bc-phone { margin: 0; font-size: 0.75rem; color: $text-secondary; }
      .bc-check { position: absolute; top: 10px; right: 10px; width: 22px; height: 22px; border-radius: 50%; background: $primary; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; }
    }

    /* Address form */
    .address-form { display: flex; flex-direction: column; gap: 4px; }
    .full-field { width: 100%; }
    .hc-note { display: flex; align-items: flex-start; gap: 8px; padding: 12px 14px; background: #eff6ff; border-radius: $border-radius; margin-top: 8px; mat-icon { color: $primary; flex-shrink: 0; font-size: 18px; } p { margin: 0; font-size: 0.8rem; color: $primary; } }

    /* Date/Time */
    .date-field { width: 100%; max-width: 280px; margin-bottom: 20px; }
    .slots-title { margin: 0 0 12px; font-size: 0.875rem; font-weight: 600; color: $text-secondary; }
    .time-slots-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;
      @media (max-width: 576px) { grid-template-columns: repeat(3, 1fr); }
    }
    .ts-btn { padding: 10px 4px; border: 1.5px solid $border-color; border-radius: $border-radius; background: white; cursor: pointer; font-size: 0.8rem; text-align: center; transition: all 0.15s;
      &:hover { border-color: $primary; }
      &.selected { border-color: $primary; background: $primary; color: white; }
    }

    /* Patient */
    .patient-cards { display: flex; flex-direction: column; gap: 10px; }
    .patient-card {
      display: flex; align-items: center; gap: 14px; padding: 14px 16px;
      border: 2px solid $border-color; border-radius: $border-radius; cursor: pointer; transition: all 0.15s; position: relative;
      &:hover { border-color: $primary; }
      &.selected { border-color: $primary; background: $primary-light; }
    }
    .pc-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; color: white; flex-shrink: 0; background: $gray-300;
      &.self { background: $primary; }
      &.gender-male { background: #3b82f6; }
      &.gender-female { background: #e91e63; }
    }
    .pc-info { flex: 1; strong { display: block; font-weight: 600; } span { font-size: 0.8rem; color: $text-secondary; } }
    .pc-check { width: 24px; height: 24px; border-radius: 50%; background: $primary; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
    .no-family { font-size: 0.875rem; color: $text-secondary; a { color: $primary; } }

    /* Review */
    .review-card { display: flex; flex-direction: column; gap: 20px; }
    .review-section { border: 1px solid $border-color; border-radius: $border-radius; overflow: hidden; h5 { margin: 0; padding: 12px 16px; background: $gray-50; font-size: 0.85rem; font-weight: 600; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid $border-color; } }
    .review-row, .item-review-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; font-size: 0.875rem; border-bottom: 1px solid $gray-50; &:last-child { border-bottom: none; } .rv-label { color: $text-secondary; } .rv-val { font-weight: 500; } }
    .item-review-row { &.pkg { color: $primary; } }
    .total-row { display: flex; justify-content: space-between; padding: 12px 16px; background: $gray-50; font-weight: 600; border-top: 1px solid $border-color; }
    .total-price { color: $primary; font-size: 1.05rem; }

    /* Footer */
    .wizard-footer { display: flex; justify-content: space-between; align-items: center; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* Skeletons */
    .skel { border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .item-skel { height: 56px; margin-bottom: 6px; }
    .branch-skel { height: 130px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Success */
    .success-screen { display: flex; justify-content: center; padding: 40px 16px; }
    .success-card { background: white; border-radius: $border-radius-lg; padding: 40px; max-width: 480px; width: 100%; box-shadow: $shadow-md; border: 1px solid $border-color; text-align: center; }
    .success-icon { font-size: 3rem; margin-bottom: 16px; }
    .success-card h2 { margin: 0 0 8px; color: $success; }
    .success-sub { color: $text-secondary; margin: 0 0 28px; }
    .success-summary { text-align: left; border: 1px solid $border-color; border-radius: $border-radius; overflow: hidden; margin-bottom: 28px; }
    .ss-row { display: flex; justify-content: space-between; padding: 10px 16px; font-size: 0.875rem; border-bottom: 1px solid $gray-50; &:last-child { border-bottom: none; } .ss-label { color: $text-secondary; } .ss-val { font-weight: 500; } &.total-row { background: $gray-50; font-weight: 700; } .price { color: $primary; font-size: 1rem; } }
    .success-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  `]
})
export class BookComponent implements OnInit {
  store = inject(BookingStore);
  familyStore = inject(FamilyMembersStore);
  ctx = inject(CurrentPatientContextService);
  private testApi = inject(LabTestApiService);
  private packageApi = inject(PackageApiService);
  private branchApi = inject(BranchApiService);
  private appointmentApi = inject(AppointmentApiService);
  private hcApi = inject(HomeCollectionApiService);
  private toast = inject(ToastService);

  bookingComplete = signal(false);
  selectionTab = signal<'tests' | 'packages'>('tests');
  testSearch = '';
  selectedCategoryId = '';

  tests = signal<LabTest[]>([]);
  packages = signal<HealthPackage[]>([]);
  branches = signal<Branch[]>([]);
  categories = signal<TestCategory[]>([]);
  testsLoading = signal(false);
  packagesLoading = signal(false);
  branchesLoading = signal(false);

  stepNumbers = [1, 2, 3, 4, 5, 6];
  today = new Date().toISOString().split('T')[0];
  cities = ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar', 'Taif', 'Abha'];
  timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  ngOnInit(): void {
    this.store.reset();
    this.ctx.load();
    this.familyStore.load();
    this.loadCategories();
    this.loadTests();
    this.loadPackages();
    this.loadBranches();
  }

  loadCategories(): void {
    this.testApi.getCategories().subscribe({
      next: res => this.categories.set(res.data ?? []),
      error: () => {},
    });
  }

  loadTests(): void {
    this.testsLoading.set(true);
    const params = this.selectedCategoryId ? { categoryId: this.selectedCategoryId } : undefined;
    this.testApi.getTests(params).subscribe({
      next: res => { this.tests.set(res.data?.items ?? []); this.testsLoading.set(false); },
      error: () => this.testsLoading.set(false),
    });
  }

  onTestSearch(query: string): void {
    if (!query.trim()) { this.loadTests(); return; }
    this.testsLoading.set(true);
    this.testApi.searchTests(query).subscribe({
      next: res => { this.tests.set(res.data ?? []); this.testsLoading.set(false); },
      error: () => this.testsLoading.set(false),
    });
  }

  loadPackages(): void {
    this.packagesLoading.set(true);
    this.packageApi.getAll().subscribe({
      next: res => { this.packages.set(res.data?.items ?? []); this.packagesLoading.set(false); },
      error: () => this.packagesLoading.set(false),
    });
  }

  loadBranches(): void {
    this.branchesLoading.set(true);
    this.branchApi.getActive().subscribe({
      next: res => { this.branches.set(res.data ?? []); this.branchesLoading.set(false); },
      error: () => this.branchesLoading.set(false),
    });
  }

  selectSelf(): void {
    this.store.selectedPatient.set({
      id: this.ctx.patientId(),
      name: this.ctx.fullName() || 'Myself',
      isSelf: true,
    });
  }

  selectMember(member: any): void {
    this.store.selectedPatient.set({
      id: member.id,
      name: member.fullName,
      isSelf: false,
    });
  }

  submit(): void {
    const patientId = this.ctx.patientId();
    this.store.isSubmitting.set(true);

    if (this.store.appointmentType() === 'branch') {
      this.appointmentApi.create({
        patientId,
        branchId: this.store.selectedBranch()!.id,
        appointmentDate: this.store.appointmentDate(),
        appointmentTime: this.store.appointmentTime(),
        type: 'branch',
        testIds: this.store.testIds(),
        packageIds: this.store.packageIds().length > 0 ? this.store.packageIds() : undefined,
        notes: this.store.notes() || undefined,
      }).subscribe({
        next: res => {
          this.store.isSubmitting.set(false);
          if (res.success) {
            this.bookingComplete.set(true);
          } else {
            this.toast.error(res.message ?? 'Booking failed. Please try again.');
          }
        },
        error: () => {
          this.store.isSubmitting.set(false);
          this.toast.error('Booking failed. Please try again.');
        },
      });
    } else {
      this.hcApi.create({
        patientId,
        address: this.store.address(),
        city: this.store.city(),
        preferredDate: this.store.appointmentDate(),
        preferredTimeSlot: this.store.appointmentTime(),
        testIds: this.store.testIds(),
        packageIds: this.store.packageIds().length > 0 ? this.store.packageIds() : undefined,
        notes: this.store.notes() || undefined,
      }).subscribe({
        next: res => {
          this.store.isSubmitting.set(false);
          if (res.success) {
            this.bookingComplete.set(true);
          } else {
            this.toast.error(res.message ?? 'Booking failed. Please try again.');
          }
        },
        error: () => {
          this.store.isSubmitting.set(false);
          this.toast.error('Booking failed. Please try again.');
        },
      });
    }
  }
}
