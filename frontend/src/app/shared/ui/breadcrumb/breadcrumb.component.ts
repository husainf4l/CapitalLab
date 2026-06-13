import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      @for (item of items(); track $index; let last = $last) {
        @if (!last) {
          <a [routerLink]="item.route" class="crumb crumb-link">{{ item.label }}</a>
          <mat-icon class="sep">chevron_right</mat-icon>
        } @else {
          <span class="crumb crumb-current" aria-current="page">{{ item.label }}</span>
        }
      }
    </nav>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .crumb {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .crumb-link {
      color: $text-secondary;
      text-decoration: none;
      &:hover { color: $primary; text-decoration: underline; }
    }

    .crumb-current {
      color: $text-primary;
    }

    .sep {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: $text-secondary;
      opacity: 0.5;
    }
  `]
})
export class BreadcrumbComponent {
  items = input.required<BreadcrumbItem[]>();
}
