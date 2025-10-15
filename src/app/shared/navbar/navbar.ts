import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

declare global {
  interface Window {
    electronAPI: {
      getUsers: () => Promise<{ id: number; name: string }[]>;
      addUser: (name: string) => Promise<{ id: number; name: string }>;
    };
  }
}

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  public sidebarIsOpen: boolean = false;
  public theme: string = this.getTheme;

  constructor(){
  }

  public toggleSidebar() {
    this.sidebarIsOpen = !this.sidebarIsOpen;
  }

  private get getTheme(): string {
    return document.body.classList.contains('dark') ? 'dark' : 'light';
  }

  public toggleTheme() {
    document.body.classList.toggle('dark');
    this.theme = this.getTheme; 
  }
}
