import { Injectable, inject, OnDestroy, NgZone } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';

export type HubName = 'notifications' | 'lab';

type Handler = (...args: unknown[]) => void;

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private tokenStorage = inject(TokenStorageService);
  private zone = inject(NgZone);

  private connections = new Map<HubName, signalR.HubConnection>();
  private handlers = new Map<string, Set<Handler>>();

  private buildConnection(hub: HubName): signalR.HubConnection {
    return new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl.replace(/\/api.*$/, '')}/hubs/${hub === 'lab' ? 'lab' : 'notifications'}`, {
        accessTokenFactory: () => this.tokenStorage.getAccessToken() ?? '',
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: false,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();
  }

  /** Connect to a hub. Safe to call multiple times — idempotent. */
  connect(hub: HubName): void {
    if (this.connections.has(hub)) return;

    const conn = this.buildConnection(hub);
    this.connections.set(hub, conn);

    conn.onreconnecting(() => console.debug(`[SignalR] ${hub}: reconnecting…`));
    conn.onreconnected(() => console.debug(`[SignalR] ${hub}: reconnected`));

    conn.start()
      .then(() => console.debug(`[SignalR] ${hub}: connected`))
      .catch(err => console.warn(`[SignalR] ${hub}: failed to connect`, err));
  }

  /** Disconnect a hub. */
  disconnect(hub: HubName): void {
    const conn = this.connections.get(hub);
    if (!conn) return;
    conn.stop().catch(() => {});
    this.connections.delete(hub);
  }

  /** Register an event listener. Returns an unsubscribe function. */
  on<T = unknown>(hub: HubName, event: string, callback: (data: T) => void): () => void {
    const conn = this.connections.get(hub);

    const wrapped: Handler = (...args) => {
      this.zone.run(() => callback(args[0] as T));
    };

    const key = `${hub}:${event}`;
    if (!this.handlers.has(key)) this.handlers.set(key, new Set());
    this.handlers.get(key)!.add(wrapped);

    if (conn) {
      conn.on(event, wrapped as (...args: unknown[]) => void);
    }

    return () => this.off(hub, event, wrapped);
  }

  private off(hub: HubName, event: string, wrapped: Handler): void {
    const conn = this.connections.get(hub);
    if (conn) conn.off(event, wrapped as (...args: unknown[]) => void);
    const key = `${hub}:${event}`;
    this.handlers.get(key)?.delete(wrapped);
  }

  ngOnDestroy(): void {
    this.connections.forEach(conn => conn.stop().catch(() => {}));
    this.connections.clear();
  }
}
