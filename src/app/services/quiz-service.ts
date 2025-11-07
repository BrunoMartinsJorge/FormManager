import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../core/environments/environment';
import { QuestaoSalva } from '../pages/questoes-salvas-quiz/model/QuestaoSalva';
import { QuizDto } from '../pages/listar-quiz/models/QuizDto';
import { QuizSelected } from '../shared/models/QuizSelected.model';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private baseUrl = environment.apiUrl;
  private readonly quizEndpoint = '/quiz';

  constructor(private http: HttpClient) {}

  /**
   *
   * @description Busca todos os quizzes
   * @returns Observable containing all quizzes
   */
  public getAllQuizzes(): Observable<any> {
    return this.http.get(`${this.baseUrl}${this.quizEndpoint}`);
  }

  public criarQuiz(quiz: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/quiz`, quiz);
  }

  public buscarRespostasDeFormularioPorIdForm(
    formId: string
  ): Observable<QuizSelected> {
    return this.http.get<QuizSelected>(
      `${this.baseUrl}/quiz/${formId}/responses`
    );
  }

  public editarQuestao(questao: QuestaoSalva): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/quiz/questoes-salvas`, questao);
  }

  public apagarQuestao(questaoId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.baseUrl}/quiz/questoes-salvas/${questaoId}`
    );
  }
}
