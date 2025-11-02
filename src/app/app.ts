import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
// import { Token } from './core/auth/token';
import { Navbar } from './shared/components/navbar/navbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, Navbar, CommonModule, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [MessageService],
})
export class App {
  protected readonly title = signal('Angular_Electron');
  public navbarAtiva: boolean = false;

  public theme: 'dark' | 'light' = 'light';
  private observer!: MutationObserver;

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateTheme();
    this.observer = new MutationObserver(() => this.updateTheme());
    this.observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

  private updateTheme() {
    this.theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  }

  public isAuthenticated(): boolean {
    return this.router.url !== '/';
  }
}
