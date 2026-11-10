import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AccountSessionService } from './account-session.service';

@Component({
  selector: 'app-root', imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent {
  readonly session = inject(AccountSessionService);
  readonly year = new Date().getFullYear();
  readonly links = [
    { path: 'inicio', label: 'Inicio', icon: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z' },
    { path: 'acerca', label: 'Acerca de', icon: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-11v6m0-10h.01' },
    { path: 'politicas', label: 'Políticas', icon: 'M6 3h9l5 5v13H6zM15 3v5h5M9 12h8m-8 4h8' },
    { path: 'condiciones', label: 'Condiciones', icon: 'M9 4h6a2 2 0 0 1 2 2v1h3v14H4V7h3V6a2 2 0 0 1 2-2Zm0 3h6V6H9Zm-2 7 3 3 6-6' },
    { path: 'establecimientos', label: 'Establecimientos', icon: 'M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
    { path: 'cuenta', label: 'Mi Cuenta', icon: 'M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z' },
    { path: 'contacto', label: 'Contáctenos', icon: 'M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z' }
  ];
}
