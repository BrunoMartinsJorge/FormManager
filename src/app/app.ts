import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Navbar } from './shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { Token } from './core/auth/token';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, Navbar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
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
