import { Component, input, output, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  template: `
    <div class="search-wrap" role="search">
      <mat-icon class="ico" aria-hidden="true">search</mat-icon>
      <input
        class="inp"
        type="search"
        [placeholder]="placeholder()"
        [attr.aria-label]="ariaLabel() || placeholder()"
        [value]="value()"
        (input)="onInput($event)"
        autocomplete="off"
      />
      @if (value()) {
        <button class="clear" (click)="clear()" aria-label="Clear search" type="button">
          <mat-icon aria-hidden="true">close</mat-icon>
        </button>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .search-wrap {
      display: flex; align-items: center; gap: 8px;
      background: white; border: 1px solid $border-color; border-radius: $border-radius-full;
      padding: 8px 14px;
      &:focus-within { border-color: $primary; box-shadow: 0 0 0 3px #{$primary-light}; }
    }
    .ico { color: $text-secondary; font-size: 18px; flex-shrink: 0; }
    .inp {
      flex: 1; border: none; outline: none; font-size: $font-size-sm;
      background: transparent; color: $text-primary; min-width: 0;
      &::placeholder { color: $text-disabled; }
    }
    .clear {
      background: none; border: none; cursor: pointer; color: $text-secondary;
      display: flex; align-items: center; padding: 0; flex-shrink: 0;
      mat-icon { font-size: 16px; }
      &:hover { color: $danger; }
    }
  `]
})
export class AppSearchInputComponent implements OnInit, OnDestroy {
  placeholder = input('Search…');
  ariaLabel   = input('');
  debounceMs  = input(300);

  searched = output<string>();

  value    = signal('');
  private input$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.input$.pipe(
      debounceTime(this.debounceMs()),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(v => this.searched.emit(v));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.value.set(v);
    this.input$.next(v);
  }

  clear(): void {
    this.value.set('');
    this.input$.next('');
  }
}
