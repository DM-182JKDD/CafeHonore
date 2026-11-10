import { Injectable, signal } from '@angular/core';
import { Account } from './api.service';

@Injectable({ providedIn: 'root' })
export class AccountSessionService {
  readonly account = signal<Account | null>(null);

  setAccount(account: Account): void {
    this.account.set(account);
  }

  clear(): void {
    this.account.set(null);
  }
}
