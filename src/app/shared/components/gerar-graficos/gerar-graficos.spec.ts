import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerarGraficos } from './gerar-graficos';

describe('GerarGraficos', () => {
  let component: GerarGraficos;
  let fixture: ComponentFixture<GerarGraficos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerarGraficos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerarGraficos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
