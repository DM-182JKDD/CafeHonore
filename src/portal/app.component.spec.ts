import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('Navegación y apariencia del portal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AppComponent], providers: [provideRouter([])] });
  });

  it('conserva las siete opciones originales', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const links = Array.from(fixture.nativeElement.querySelectorAll('.nav-links a')) as HTMLAnchorElement[];
    expect(links.map(link => link.textContent?.trim())).toEqual(['Inicio', 'Acerca de', 'Políticas', 'Condiciones', 'Establecimientos', 'Mi Cuenta', 'Contáctenos']);
  });

  it('usa una única apariencia y no presenta un control para cambiarla', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.navigation button').length).toBe(0);
  });

  it('mantiene las siete rutas visibles sin un control de menú colapsable', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.nav-links a').length).toBe(7);
    expect(fixture.nativeElement.querySelector('.menu-toggle')).toBeNull();
  });
});
