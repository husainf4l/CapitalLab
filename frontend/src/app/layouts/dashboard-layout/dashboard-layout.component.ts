import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="dashboard-layout">
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { min-height: 100vh; }
  `]
})
export class DashboardLayoutComponent {}
