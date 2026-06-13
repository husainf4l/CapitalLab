import { Component, input, output, signal, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  template: `
    <div class="search-bar" role="search">
      <mat-icon class="search-icon" aria-hidden="true">search</mat-icon>
      <input
        type="search"
        [id]="inputId"
        [placeholder]="placeholder()"
        [attr.aria-label]="ariaLabel() || placeholder()"
        [(ngModel)]="value"
        (ngModelChange)="searched.emit($event)"
        class="search-input"
        autocomplete="off"
      />
      @if (value) {
        <button class="clear-btn" (click)="value = ''; searched.emit('')" aria-label="Clear search">
          <mat-icon aria-hidden="true">close</mat-icon>
        </button>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .search-bar {
      display: flex; align-items: center;
      background: white; border: 1px solid $border-color;
      border-radius: $border-radius-full; padding: 10px 16px; gap: 8px;
      &:focus-within { border-color: $primary; box-shadow: 0 0 0 3px #{$primary-light}; }
    }
    .search-icon { color: $text-secondary; font-size: 20px; }
    .search-input {
      flex: 1; border: none; outline: none;
      font-size: $font-size-md; background: transparent; color: $text-primary;
      &::placeholder { color: $text-disabled; }
    }
    .clear-btn {
      background: none; border: none; cursor: pointer; color: $text-secondary;
      display: flex; align-items: center; padding: 0;
      mat-icon { font-size: 18px; }
      &:hover { color: $danger; }
    }
  `]
})
export class AppSearchBarComponent {
  placeholder = input('Search...');
  ariaLabel  = input('');
  value = '';
  inputId = `search-${Math.random().toString(36).slice(2, 8)}`;
  searched = output<string>();
}
