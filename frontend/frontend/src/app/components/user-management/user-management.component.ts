import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSelectModule,
    FormsModule,
    MatSnackBarModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Manage Users</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <table mat-table [dataSource]="users" class="mat-elevation-z8">
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef> Username </th>
            <td mat-cell *matCellDef="let user"> {{ user.username }} </td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef> Email </th>
            <td mat-cell *matCellDef="let user"> {{ user.email }} </td>
          </ng-container>
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef> Role </th>
            <td mat-cell *matCellDef="let user">
              <mat-select [(ngModel)]="user.role" (selectionChange)="updateRole(user)">
                <mat-option *ngFor="let role of roles" [value]="role">{{ role }}</mat-option>
              </mat-select>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let user">
              <button mat-button color="warn" (click)="updateRole(user)">Save</button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    table {
      width: 100%;
    }
    .mat-elevation-z8 {
      box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12);
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['username', 'email', 'role', 'actions'];
  roles = ['Admin', 'Editor', 'Writer', 'Reader'];

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => this.users = users,
      error: () => this.snackBar.open('Failed to load users', 'Close', { duration: 3000 })
    });
  }

  updateRole(user: User): void {
    this.userService.updateUserRole(user._id, user.role).subscribe({
      next: () => this.snackBar.open('Role updated', 'Close', { duration: 3000 }),
      error: () => this.snackBar.open('Failed to update role', 'Close', { duration: 3000 })
    });
  }
}