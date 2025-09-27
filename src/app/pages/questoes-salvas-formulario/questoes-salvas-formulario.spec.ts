import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestoesSalvasFormulario } from './questoes-salvas-formulario';

describe('QuestoesSalvasFormulario', () => {
  let component: QuestoesSalvasFormulario;
  let fixture: ComponentFixture<QuestoesSalvasFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestoesSalvasFormulario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestoesSalvasFormulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
