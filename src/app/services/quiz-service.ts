import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../core/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  private baseUrl = environment.apiUrl;
  private readonly quizEndpoint = '/quiz';

  constructor(private http: HttpClient) { }

  /**
   * 
   * @description Busca todos os quizzes
   * @returns Observable containing all quizzes
   */
  public getAllQuizzes(): Observable<any> {
    return this.http.get(`${this.baseUrl}${this.quizEndpoint}`);
  }

    public criarFormulario(formulario: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}${this.quizEndpoint}`, formulario);
    }
  
    public criarQuiz(quiz: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}/quiz`, quiz);
    }
  
    public deletarFormulario(formId: number) {
      return this.http.delete(`${this.baseUrl}/api/forms/${formId}`, {
        responseType: 'text',
      });
    }
    public buscarRespostasDeFormularioPorIdForm(formId: string): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}/quiz/${formId}/responses`);
    }
  
    public buscarQuestoesDeFormularioPorIdForm(formId: string): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}/forms/quest/${formId}`);
    }
}
