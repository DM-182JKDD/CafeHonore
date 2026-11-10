import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ApiService } from './api.service';
import { AccountSessionService } from './account-session.service';
import { AppComponent } from './app.component';
import { PageComponent } from './page.component';

describe('Carrusel automático', () => {
  let reduceMotion = false;
  beforeEach(() => {
    vi.useFakeTimers();
    reduceMotion = false;
    vi.stubGlobal('matchMedia', () => ({ matches: reduceMotion, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    TestBed.configureTestingModule({
      imports: [PageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { data: of({ page: 'inicio' }) } },
        { provide: ApiService, useValue: { ready: signal(false) } }
      ]
    });
  });

  afterEach(() => { TestBed.resetTestingModule(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('recorre las tres marcas y vuelve a la primera cada cinco segundos', () => {
    const fixture = TestBed.createComponent(PageComponent);
    expect(fixture.componentInstance.slide()).toBe(0);
    vi.advanceTimersByTime(5000);
    expect(fixture.componentInstance.slide()).toBe(1);
    vi.advanceTimersByTime(10000);
    expect(fixture.componentInstance.slide()).toBe(0);
  });

  it('se detiene al pausar, pasar el puntero o enfocar sus controles', () => {
    const fixture = TestBed.createComponent(PageComponent);
    const page = fixture.componentInstance;
    page.hovering.set(true); vi.advanceTimersByTime(5000);
    expect(page.slide()).toBe(0);
    page.hovering.set(false); page.focusWithin.set(true); vi.advanceTimersByTime(5000);
    expect(page.slide()).toBe(0);
    page.focusWithin.set(false); page.playing.set(false); vi.advanceTimersByTime(5000);
    expect(page.slide()).toBe(0);
    page.playing.set(true); vi.advanceTimersByTime(5000);
    expect(page.slide()).toBe(1);
  });

  it('no reproduce automáticamente con movimiento reducido y limpia su temporizador al salir', () => {
    reduceMotion = true;
    const fixture = TestBed.createComponent(PageComponent);
    expect(fixture.componentInstance.playing()).toBe(false);
    vi.advanceTimersByTime(10000);
    expect(fixture.componentInstance.slide()).toBe(0);
    fixture.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('Vistas autenticadas de Mi Cuenta', () => {
  let apiLogout: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    apiLogout = vi.fn();
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    TestBed.configureTestingModule({
      imports: [PageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { data: of({ page: 'cuenta' }) } },
        { provide: ApiService, useValue: { ready: signal(false), login: vi.fn(), logout: apiLogout } }
      ]
    });
  });
  afterEach(() => { TestBed.resetTestingModule(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('muestra el resumen y las seis secciones sin datos privados no disponibles en la API', () => {
    const fixture = TestBed.createComponent(PageComponent);
    fixture.componentInstance.account.set({ name: 'Miembro de prueba', points: 12 });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.page-heading')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.account-nav-link').length).toBe(7);
    expect(fixture.nativeElement.textContent).toContain('12');
    expect(fixture.nativeElement.textContent).toContain('Los movimientos estarán disponibles');
    expect(fixture.nativeElement.textContent).not.toContain('@');
  });

  it('navega por los formularios de cuenta y los mantiene deshabilitados hasta conectar la API', () => {
    const fixture = TestBed.createComponent(PageComponent);
    fixture.componentInstance.account.set({ name: 'Miembro de prueba', points: 12 });
    fixture.detectChanges();
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('.account-nav-link') as NodeListOf<HTMLButtonElement>);
    const changePassword = buttons.find(button => button.textContent?.includes('Cambiar contraseña'))!;
    changePassword.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Contraseña anterior');
    expect((fixture.nativeElement.querySelector('.account-form') as HTMLFieldSetElement).disabled).toBe(true);

    const updateProfile = buttons.find(button => button.textContent?.includes('Actualizar datos'))!;
    updateProfile.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Correo electrónico');
    expect(fixture.nativeElement.textContent).toContain('La edición de datos estará disponible');

    buttons.find(button => button.textContent?.includes('Mis movimientos'))!.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Movimientos de la cuenta');

    buttons.find(button => button.textContent?.includes('Establecimientos'))!.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('CAFÉ HONORÉ');

    buttons.find(button => button.textContent?.includes('Premios'))!.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Catálogo de premios');

    buttons.find(button => button.textContent?.trim() === 'Inicio')!.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Movimientos recientes');
  });

  it('permite explorar datos ficticios sin API y sale del demo sin llamar al servidor', () => {
    const fixture = TestBed.createComponent(PageComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.demo-entry button').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.demoMode()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Usuario Demo');
    expect(fixture.nativeElement.textContent).toContain('demo@example.com');
    expect(fixture.nativeElement.textContent).toContain('DEMO-1042');
    expect(fixture.nativeElement.textContent).toContain('+504 0000-0000');
    expect(fixture.nativeElement.querySelector('.account-member')).toBeNull();
    expect(fixture.nativeElement.querySelector('.account-avatar')).toBeNull();
    expect(fixture.nativeElement.querySelector('.demo-badge')).toBeNull();
    expect(fixture.nativeElement.querySelector('.demo-notice')).toBeNull();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('.account-nav-link') as NodeListOf<HTMLButtonElement>);
    buttons.find(button => button.textContent?.includes('Mis movimientos'))!.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('DEMO-1007');
    expect(fixture.nativeElement.textContent).not.toContain('Modo demo');

    buttons.find(button => button.textContent?.includes('Actualizar datos'))!.click();
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('#profile-phone') as HTMLInputElement).value).toBe('+504 0000-0000');
    expect((fixture.nativeElement.querySelector('#profile-mobile') as HTMLInputElement).value).toBe('+504 0000-0000');

    buttons.find(button => button.textContent?.includes('Premios'))!.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Café de cortesía');
    expect(fixture.nativeElement.textContent).not.toContain('Modo demostración');

    buttons.find(button => button.textContent?.trim() === 'Cerrar sesión')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.demoMode()).toBe(false);
    expect(fixture.nativeElement.querySelector('.demo-entry')).not.toBeNull();
    expect(apiLogout).not.toHaveBeenCalled();
  });

  it('colapsa el menú de cuenta y lo cierra al elegir una sección', () => {
    const fixture = TestBed.createComponent(PageComponent);
    fixture.componentInstance.account.set({ name: 'Usuario Demo', points: 120 });
    fixture.detectChanges();

    expect(fixture.componentInstance.accountMenuOpen()).toBe(false);
    const toggle = fixture.nativeElement.querySelector('.account-menu-toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.accountMenuOpen()).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('.account-menu-backdrop')).not.toBeNull();

    const movements = Array.from(fixture.nativeElement.querySelectorAll('.account-nav-link') as NodeListOf<HTMLButtonElement>).find(button => button.textContent?.includes('Mis movimientos'))!;
    movements.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.accountMenuOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.account-menu-backdrop')).toBeNull();
    expect(fixture.componentInstance.accountView()).toBe('movimientos');
  });

  it('refleja el acceso demo en la barra superior', () => {
    const fixture = TestBed.createComponent(PageComponent);
    fixture.detectChanges();
    fixture.componentInstance.enterDemo();
    fixture.detectChanges();

    const appFixture = TestBed.createComponent(AppComponent);
    appFixture.detectChanges();
    expect(appFixture.nativeElement.querySelector('.topbar a')?.textContent?.trim()).toBe('Usuario Demo');
  });
});
