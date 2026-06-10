import { Component, input, output, signal, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  template: `
    <div class="search-bar">
      <mat-icon class="search-icon">search</mat-icon>
      <input
        type="text"
        [placeholder]="placeholder()"
        [(ngModel)]="value"
        (ngModelChange)="searched.emit($event)"
        class="search-input"
      />
      @if (value) {
        <button class="clear-btn" (click)="value = ''; searched.emit('')">
          <mat-icon>close</mat-icon>
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
  value = '';
  searched = output<string>();
}
