import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, Account } from './api.service';
import { AccountSessionService } from './account-session.service';
import { OriginalSectionComponent } from './original-section.component';

type AccountView = 'inicio' | 'movimientos' | 'password' | 'perfil' | 'establecimientos' | 'premios';

interface DemoMovement {
  code: string;
  establishment: string;
  description: string;
  date: string;
  charge: number;
  credit: number;
  balance: number;
}

@Component({ selector: 'app-page', imports: [ReactiveFormsModule, OriginalSectionComponent], templateUrl: './page.component.html' })
export class PageComponent {
  readonly api = inject(ApiService);
  private readonly accountSession = inject(AccountSessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly page = signal('inicio');
  readonly slide = signal(0);
  readonly reducedMotion = signal(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  readonly playing = signal(!this.reducedMotion());
  readonly hovering = signal(false);
  readonly focusWithin = signal(false);
  readonly controlsQuiet = signal(false);
  readonly busy = signal(false);
  readonly message = signal('');
  readonly account = this.accountSession.account;
  readonly demoMode = signal(false);
  readonly accountView = signal<AccountView>('inicio');
  readonly accountMenuOpen = signal(false);
  readonly demoMovements: readonly DemoMovement[] = [
    { code: 'DEMO-1042', establishment: 'Café Honoré', description: 'Acumulación de puntos', date: '2026-10-28', charge: 0, credit: 12, balance: 120 },
    { code: 'DEMO-1038', establishment: 'Flores y Canastas Honoré', description: 'Acumulación de puntos', date: '2026-10-12', charge: 0, credit: 8, balance: 108 },
    { code: 'DEMO-1021', establishment: 'Marco Aldany', description: 'Canje de beneficio demo', date: '2026-09-30', charge: 20, credit: 0, balance: 100 },
    { code: 'DEMO-1007', establishment: 'Café Honoré', description: 'Acumulación de puntos', date: '2026-09-14', charge: 0, credit: 20, balance: 120 }
  ];
  readonly accountNavigation: readonly { id: AccountView; label: string }[] = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'movimientos', label: 'Mis movimientos' },
    { id: 'password', label: 'Cambiar contraseña' },
    { id: 'perfil', label: 'Actualizar datos' },
    { id: 'establecimientos', label: 'Establecimientos' },
    { id: 'premios', label: 'Premios' }
  ];
  readonly slides = [
    { image: 'Slide1.jpg', name: 'Café Honoré', url: 'http://www.cafehonore.hn/' },
    { image: 'Slide2.jpg', name: 'Marco Aldany', url: 'http://marcoaldany.hn/' },
    { image: 'Slide3.jpg', name: 'Flores y Canastas Honoré', url: 'http://floreshonore.hn/' }
  ];
  readonly titles: Record<string, string> = { acerca: 'Acerca de', politicas: 'Políticas', condiciones: 'Condiciones', establecimientos: 'Establecimientos', cuenta: 'Mi Cuenta', contacto: 'Contáctenos' };
  private controlsFadeTimer: number | undefined;
  readonly loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(48)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(17)] }),
    rememberPassword: new FormControl(false, { nonNullable: true })
  });
  readonly contactForm = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(25)] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(25)] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(8)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(50)] }),
    cardNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(16)] }),
    message: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(150)] })
  });
  constructor() {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (event: MediaQueryListEvent): void => {
      this.reducedMotion.set(event.matches);
      if (event.matches) this.playing.set(false);
    };
    motion.addEventListener('change', onMotionChange);
    this.resetCarouselControls();
    const timer = window.setInterval(() => {
      if (this.page() === 'inicio' && this.playing() && !this.hovering() && !this.focusWithin() && !document.hidden) {
        this.slide.update(value => (value + 1) % this.slides.length);
      }
    }, 5000);
    this.destroyRef.onDestroy(() => {
      window.clearInterval(timer);
      if (this.controlsFadeTimer !== undefined) window.clearTimeout(this.controlsFadeTimer);
      motion.removeEventListener('change', onMotionChange);
    });
    this.route.data.pipe(takeUntilDestroyed()).subscribe(data => {
      this.page.set(data['page'] as string);
      this.message.set('');
      document.title = `${this.titles[this.page()] ?? 'Inicio'} · +PLUS Café Honoré`;
    });
  }
  moveSlide(direction: number): void { this.slide.update(value => (value + direction + this.slides.length) % this.slides.length); }
  selectSlide(index: number): void { this.slide.set(index); this.resetCarouselControls(); }
  selectAccountView(view: AccountView): void { this.accountView.set(view); this.accountMenuOpen.set(false); this.message.set(''); }
  toggleAccountMenu(): void { this.accountMenuOpen.update(open => !open); }
  enterDemo(): void {
    this.accountSession.setAccount({ name: 'Usuario Demo', points: 120 });
    this.demoMode.set(true);
    this.accountView.set('inicio');
    this.accountMenuOpen.set(false);
    this.message.set('');
  }
  private resetCarouselControls(): void {
    this.controlsQuiet.set(false);
    if (this.controlsFadeTimer !== undefined) window.clearTimeout(this.controlsFadeTimer);
    this.controlsFadeTimer = window.setTimeout(() => this.controlsQuiet.set(true), 2600);
  }
  onCarouselFocusOut(event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) this.focusWithin.set(false);
  }
  async login(): Promise<void> {
    if (this.busy()) return;
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid || !this.api.ready()) return;
    this.busy.set(true); this.message.set('');
    try {
      const { username, password } = this.loginForm.getRawValue();
      const result = await this.api.login(username, password);
      if (typeof result.name !== 'string' || typeof result.points !== 'number') throw new Error('Respuesta inválida');
      this.accountSession.setAccount(result); this.demoMode.set(false); this.accountView.set('inicio'); this.loginForm.reset();
    } catch (error) { this.message.set(error instanceof HttpErrorResponse && error.status === 401 ? 'Usuario o contraseña incorrectos.' : 'No pudimos iniciar sesión. Inténtalo más tarde.'); }
    finally { this.busy.set(false); }
  }
  async logout(): Promise<void> {
    if (this.busy()) return;
    if (this.demoMode()) {
      this.accountSession.clear(); this.demoMode.set(false); this.accountView.set('inicio'); this.accountMenuOpen.set(false); this.message.set('');
      return;
    }
    this.busy.set(true); this.message.set('');
    try { await this.api.logout(); this.accountSession.clear(); this.accountView.set('inicio'); this.accountMenuOpen.set(false); }
    catch { this.message.set('No pudimos cerrar la sesión. Inténtalo de nuevo.'); }
    finally { this.busy.set(false); }
  }
  async sendContact(): Promise<void> {
    if (this.busy()) return;
    this.contactForm.markAllAsTouched();
    if (this.contactForm.invalid || !this.api.ready()) return;
    this.busy.set(true); this.message.set('');
    try { await this.api.contact(this.contactForm.getRawValue()); this.contactForm.reset(); this.message.set('Tu mensaje se ha enviado. Gracias por contactarnos.'); }
    catch { this.message.set('No pudimos enviar tu mensaje. Tus datos siguen en el formulario para que puedas intentarlo de nuevo.'); }
    finally { this.busy.set(false); }
  }
}
