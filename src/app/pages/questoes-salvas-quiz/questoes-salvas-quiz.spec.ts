import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestoesSalvasQuiz } from './questoes-salvas-quiz';

describe('QuestoesSalvasQuiz', () => {
  let component: QuestoesSalvasQuiz;
  let fixture: ComponentFixture<QuestoesSalvasQuiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestoesSalvasQuiz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestoesSalvasQuiz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
