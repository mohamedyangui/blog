import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  template: `
    <mat-toolbar class="navbar" color="primary">
      <!-- Brand Section -->
      <div class="brand-section" routerLink="/">
        <mat-icon class="brand-icon">article</mat-icon>
        <span class="brand-text">BlogSpace</span>
        <span class="brand-subtitle">Platform</span>
      </div>

      <div class="spacer"></div>

      <!-- Navigation Links -->
      <div class="nav-links">
        <button 
          mat-button 
          class="nav-button" 
          routerLink="/articles"
          matTooltip="Browse all articles"
          routerLinkActive="active-link">
          <mat-icon>library_books</mat-icon>
          <span>Articles</span>
        </button>

        <button 
          mat-button 
          class="nav-button create-btn" 
          *ngIf="isAuthenticated" 
          routerLink="/article/new"
          matTooltip="Write a new article"
          routerLinkActive="active-link">
          <mat-icon>add_circle</mat-icon>
          <span>Create</span>
        </button>

        <button 
          mat-button 
          class="nav-button admin-btn" 
          *ngIf="isAdmin$ | async" 
          routerLink="/admin"
          matTooltip="Admin Dashboard"
          routerLinkActive="active-link">
          <mat-icon matBadge="!" matBadgeColor="warn" matBadgeSize="small">admin_panel_settings</mat-icon>
          <span>Admin</span>
        </button>
      </div>

      <!-- User Actions -->
      <div class="user-actions">
        <!-- Authenticated User Menu -->
        <div *ngIf="isAuthenticated" class="user-menu">
          <button 
            mat-icon-button 
            class="user-avatar"
            [matMenuTriggerFor]="userMenu"
            matTooltip="User menu">
            <mat-icon>account_circle</mat-icon>
          </button>
          
          <mat-menu #userMenu="matMenu" class="user-dropdown">
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </button>
            <button mat-menu-item routerLink="/settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <button mat-menu-item routerLink="/my-articles">
              <mat-icon>library_books</mat-icon>
              <span>My Articles</span>
            </button>
            <button mat-menu-item (click)="logout()" class="logout-btn">
              <mat-icon>exit_to_app</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>

        <!-- Guest Actions -->
        <div *ngIf="!isAuthenticated" class="auth-buttons">
          <button 
            mat-button 
            class="login-btn" 
            routerLink="/login"
            matTooltip="Sign in to your account">
            <mat-icon>login</mat-icon>
            <span>Login</span>
          </button>
          <button 
            mat-raised-button 
            class="register-btn" 
            routerLink="/register"
            matTooltip="Create new account">
            <span>Register</span>
          </button>
        </div>
      </div>
    </mat-toolbar>

    <!-- Main Content -->
    <div class="main-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      min-height: 64px;
      padding: 0 24px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }
    .brand-section:hover {
      background: rgba(255,255,255,0.1);
      transform: translateY(-1px);
    }
    .brand-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #fff;
    }
    .brand-text {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 14px;
      font-weight: 300;
      color: rgba(255,255,255,0.8);
      margin-left: -8px;
    }
    .nav-links {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .nav-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px !important;
      border-radius: 24px !important;
      color: rgba(255,255,255,0.9) !important;
      font-weight: 500 !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      text-transform: none !important;
   ulfon;
    .nav-button:hover {
      background: rgba(255,255,255,0.15) !important;
      transform: translateY(-1px);
    }
    .nav-button.active-link {
      background: rgba(255,255,255,0.2) !important;
      color: #fff !important;
    }
    .nav-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .create-btn {
      background: linear-gradient(45deg, #4CAF50, #45a049) !important;
      color: white !important;
    }
    .create-btn:hover {
      background: linear-gradient(45deg, #45a049, #3d8b40) !important;
    }
    .admin-btn {
      background: linear-gradient(45deg, #ff6b6b, #ee5a52) !important;
      color: white !important;
    }
    .admin-btn:hover {
      background: linear-gradient(45deg, #ee5a52, #e04848) !important;
    }
    .user-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-menu {
      display: flex;
      align-items: center;
    }
    .user-avatar {
      background: rgba(255,255,255,0.1) !important;
      color: #fff !important;
      border: 2px solid rgba(255,255,255,0.2);
    }
    .user-avatar:hover {
      background: rgba(255,255,255,0.2) !important;
    }
    .user-avatar mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .auth-buttons {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .login-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      color: rgba(255,255,255,0.9) !important;
      border: 1px solid rgba(255,255,255,0.3) !important;
      border-radius: 24px !important;
      padding: 8px 16px !important;
    }
    .login-btn:hover {
      background: rgba(255,255,255,0.1) !important;
      border-color: rgba(255,255,255,0.5) !important;
    }
    .register-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(45deg, #FFA726, #FF9800) !important;
      color: white !important;
      border-radius: 24px !important;
      padding: 8px 20px !important;
      font-weight: 600 !important;
    }
    .register-btn:hover {
      background: linear-gradient(45deg, #FF9800, #F57C00) !important;
    }
    .user-dropdown {
      margin-top: 8px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    .user-dropdown button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
    }
    .user-dropdown button:hover {
      background: rgba(103,126,234,0.1);
    }
    .logout-btn {
      color: #f44336 !important;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .main-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      min-height: calc(100vh - 64px);
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    @media (max-width: 768px) {
      .navbar { padding: 0 16px; }
      .brand-text { font-size: 20px; }
      .brand-subtitle { display: none; }
      .nav-button span { display: none; }
      .nav-button { min-width: 48px; padding: 8px 12px !important; }
      .auth-buttons .login-btn span, .auth-buttons .register-btn span { display: none; }
      .main-container { padding: 16px; }
    }
  `]
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  isAdmin$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIconSet(
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'https://fonts.gstatic.com/s/i/materialicons/v135/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2'
      )
    );

    this.isAdmin$ = this.authService.user.pipe(
      map(user => user?.role === 'Admin')
    );
  }

  ngOnInit(): void {
    this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}