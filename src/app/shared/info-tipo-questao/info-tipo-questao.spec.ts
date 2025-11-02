import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoTipoQuestao } from './info-tipo-questao';

describe('InfoTipoQuestao', () => {
  let component: InfoTipoQuestao;
  let fixture: ComponentFixture<InfoTipoQuestao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoTipoQuestao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoTipoQuestao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
