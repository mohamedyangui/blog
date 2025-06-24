import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../services/comment.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Comment } from '../../models/comment';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    DatePipe
  ],
  template: `
    <div class="comment-container" *ngFor="let comment of comments">
      <mat-card class="comment-card">
        <mat-card-content>
          <p>{{ comment.content }}</p>
          <p class="comment-meta">By {{ comment.author }} on {{ comment.createdAt | date: 'medium' }}</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary" *ngIf="isAuthenticated" (click)="replyTo(comment._id)">
            Reply
          </button>
        </mat-card-actions>
        <div class="replies" *ngIf="comment.children?.length">
          <app-comment [comments]="comment.children" [articleId]="articleId" (newComment)="emitComment()"></app-comment>
        </div>
      </mat-card>
      <div class="reply-form" *ngIf="parentId === comment._id && isAuthenticated">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reply</mat-label>
          <textarea matInput [(ngModel)]="commentContent" rows="3"></textarea>
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="postComment()" [disabled]="!commentContent">
          Post Reply
        </button>
      </div>
    </div>
  `,
  styles: [`
    .comment-container {
      margin-left: 16px;
      margin-bottom: 16px;
    }
    .comment-card {
      padding: 8px;
    }
    .comment-meta {
      font-size: 0.8em;
      color: #666;
    }
    .replies {
      margin-left: 24px;
    }
    .reply-form {
      margin-top: 8px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class CommentComponent implements OnInit {
  @Input() comments: Comment[] = [];
  @Input() articleId!: string;
  @Input() parentId?: string;
  @Output() newComment = new EventEmitter<void>();
  commentContent = '';
  isAuthenticated = false;

  constructor(
    private commentService: CommentService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
      if (user) {
        this.notificationService.join(user._id);
        this.notificationService.onNewComment().subscribe(() => {
          this.snackBar.open('New comment posted', 'Close', { duration: 3000 });
          this.newComment.emit();
        });
      }
    });
  }

  postComment(): void {
    if (this.commentContent && this.isAuthenticated) {
      this.commentService.createComment(this.commentContent, this.articleId, this.parentId).subscribe({
        next: () => {
          this.commentContent = '';
          this.parentId = undefined;
          this.newComment.emit();
          this.snackBar.open('Comment posted', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Failed to post comment', 'Close', { duration: 3000 })
        });
    }
  }

  replyTo(parentId: string): void {
    this.parentId = parentId;
  }

  emitComment(): void {
    this.newComment.emit();
  }
}