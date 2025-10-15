import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerarPdf } from './gerar-pdf';

describe('GerarPdf', () => {
  let component: GerarPdf;
  let fixture: ComponentFixture<GerarPdf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerarPdf]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerarPdf);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
