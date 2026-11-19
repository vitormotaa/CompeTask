import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { LembreteLocalService } from './services/lembrete-local.service';
import { PermissoesService } from './services/permissoes.service';
import { PushService } from './services/push.service';

describe('AppComponent', () => {
  it('should create the app', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: LembreteLocalService, useValue: { iniciar: () => undefined } },
        { provide: PermissoesService, useValue: { solicitarIniciais: () => Promise.resolve() } },
        { provide: PushService, useValue: { iniciar: () => Promise.resolve() } },
      ]
    }).compileComponents();
    
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
