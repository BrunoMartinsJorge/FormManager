import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../core/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  loginWithGoogle(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${this.baseUrl}/auth/google`).subscribe({
        next: (response) => {
          const popup = window.open(
            response.urlAuth,
            "_blank",
            "width=500,height=600"
          );

          const listener = (event: MessageEvent) => {
            const isElectron = !!(window && (window as any).process?.type);
            const allowedOrigin = isElectron ? "null" : "http://localhost:3000";

            if (event.origin !== allowedOrigin && allowedOrigin !== "null") return;

            if (event.data?.token) {
              localStorage.setItem("googleToken", JSON.stringify(event.data.token));
              resolve(event.data.token);
              window.removeEventListener("message", listener);
              popup?.close();
            }
          };

          window.addEventListener("message", listener);
        },
        error: (err) => reject(err),
      });
    });
  }


  private authenticate(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/google`);
  }
}
