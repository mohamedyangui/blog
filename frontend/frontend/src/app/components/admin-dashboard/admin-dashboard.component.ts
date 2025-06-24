import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserManagementComponent } from '../user-management/user-management.component';
import { AnalyticsComponent } from '../analytics/analytics.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserManagementComponent,
    AnalyticsComponent,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Admin Dashboard</span>
      <span class="spacer"></span>
      <button mat-icon-button (click)="logout()" aria-label="Logout">
        <mat-icon>exit_to_app</mat-icon>
      </button>
    </mat-toolbar>

    <div class="container">
      <mat-grid-list cols="2" rowHeight="400px" gutterSize="16px">
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>User Management</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <app-user-management></app-user-management>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Analytics</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <app-analytics></app-analytics>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>
    </div>
  `,
  styles: [`
    .container {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .dashboard-card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    mat-card-header {
      background-color: #f5f5f5;
      padding: 16px;
    }
    mat-card-content {
      flex: 1;
      overflow: auto;
      padding: 16px;
    }
    mat-grid-list {
      margin-top: 16px;
    }
    @media (max-width: 600px) {
      mat-grid-list {
        cols: 1;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}