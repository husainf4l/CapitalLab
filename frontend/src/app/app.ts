import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DirectionService } from './core/services/direction.service';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loading-overlay">
        <div class="global-spinner"></div>
      </div>
    }
    <router-outlet />
  `,
  styles: [`
    .loading-overlay {
      position: fixed; inset: 0; background: rgba(255,255,255,0.7);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(2px);
    }
    .global-spinner {
      width: 44px; height: 44px; border: 3px solid #e0e0e0;
      border-top-color: #1a73e8; border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class App implements OnInit {
  loadingService = inject(LoadingService);
  private directionService = inject(DirectionService);

  ngOnInit(): void {
    // Initialize direction from storage
    const dir = this.directionService.direction();
    document.documentElement.setAttribute('dir', dir);
  }
}
