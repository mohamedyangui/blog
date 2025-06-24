import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { Article } from '../../models/article';
import { Comment } from '../../models/comment';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommentComponent } from '../comment/comment.component';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule,
    MatDividerModule,
    MatToolbarModule,
    CommentComponent,
    AsyncPipe,
    DatePipe,
    RouterLink
  ],
  template: `
    <div class="page-container">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-content">
          <button mat-icon-button class="back-button" routerLink="/articles">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="hero-text" *ngIf="article">
            <h1 class="hero-title">{{ article.title }}</h1>
            <div class="article-meta">
              <span class="author">By {{ article.author }}</span>
              <mat-divider [vertical]="true" class="meta-divider"></mat-divider>
              <span class="date">{{ article.createdAt | date: 'MMM d, yyyy' }}</span>
              <mat-divider [vertical]="true" class="meta-divider"></mat-divider>
              <span class="read-time">5 min read</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-container">
        <!-- Article Content -->
        <article class="article-content" *ngIf="article">
          <div class="article-image-container" *ngIf="article.image">
            <img [src]="article.image" alt="Article image" class="article-hero-image">
            <div class="image-overlay"></div>
          </div>
          
          <div class="article-body">
            <div class="article-text">
              <p class="article-excerpt">{{ getExcerpt(article.content) }}</p>
              <div class="article-full-content">
                {{ article.content }}
              </div>
            </div>

            <!-- Tags Section -->
            <div class="tags-section" *ngIf="article.tags && article.tags.length > 0">
              <h4 class="tags-title">Tags</h4>
              <div class="tags-container">
                <mat-chip-set>
                  <mat-chip *ngFor="let tag of article.tags" class="custom-chip">
                    <mat-icon matChipAvatar>tag</mat-icon>
                    {{ tag }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons" *ngIf="canEdit() || isAdmin">
              <button mat-fab extended color="primary" *ngIf="canEdit()" [routerLink]="['/article/edit', articleId]">
                <mat-icon>edit</mat-icon>
                Edit Article
              </button>
              <button mat-fab extended color="warn" *ngIf="isAdmin" (click)="deleteArticle()">
                <mat-icon>delete</mat-icon>
                Delete Article
              </button>
            </div>
          </div>
        </article>

        <!-- Comments Section -->
        <section class="comments-section" *ngIf="isAuthenticated">
          <div class="comments-header">
            <h2 class="comments-title">
              <mat-icon class="comments-icon">forum</mat-icon>
              Discussion ({{ comments.length }})
            </h2>
          </div>

          <!-- Comment Form -->
          <mat-card class="comment-form-card" elevation="2">
            <mat-card-content>
              <form [formGroup]="commentForm" (ngSubmit)="onCommentSubmit()" class="comment-form">
                <mat-form-field appearance="outline" class="comment-input">
                  <mat-label>Share your thoughts...</mat-label>
                  <textarea 
                    matInput 
                    formControlName="content" 
                    rows="4" 
                    placeholder="What do you think about this article?"
                  ></textarea>
                  <mat-icon matSuffix>create</mat-icon>
                  <mat-error *ngIf="commentForm.get('content')?.hasError('required')">
                    Please share your thoughts before posting
                  </mat-error>
                </mat-form-field>
                <div class="form-actions">
                  <button 
                    mat-raised-button 
                    color="primary" 
                    type="submit" 
                    [disabled]="commentForm.invalid"
                    class="post-button"
                  >
                    <mat-icon>send</mat-icon>
                    Post Comment
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Comments List -->
          <div class="comments-list">
            <mat-card 
              *ngFor="let comment of comments; trackBy: trackByCommentId" 
              class="comment-card"
              elevation="1"
            >
              <mat-card-content>
                <div class="comment-header">
                  <div class="comment-avatar">
                    <mat-icon>account_circle</mat-icon>
                  </div>
                  <div class="comment-meta">
                    <span class="comment-author">{{ comment.author }}</span>
                    <span class="comment-date">{{ comment.createdAt | date: 'MMM d, yyyy' }} at {{ comment.createdAt | date: 'h:mm a' }}</span>
                  </div>
                </div>
                <div class="comment-content">
                  {{ comment.content }}
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </section>

        <!-- Login Prompt for Non-Authenticated Users -->
        <div class="login-prompt" *ngIf="!isAuthenticated">
          <mat-card class="login-card" elevation="3">
            <mat-card-content>
              <div class="login-content">
                <mat-icon class="login-icon">lock</mat-icon>
                <h3>Join the Discussion</h3>
                <p>Sign in to share your thoughts and engage with other readers</p>
                <button mat-raised-button color="primary" routerLink="/login">
                  Sign In
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .hero-header {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
      color: white;
      padding: 2rem 0;
      position: relative;
      overflow: hidden;
    }

    .hero-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23ffffff" opacity="0.05"/><circle cx="75" cy="75" r="1" fill="%23ffffff" opacity="0.05"/><circle cx="50" cy="10" r="0.5" fill="%23ffffff" opacity="0.03"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      pointer-events: none;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .back-button {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .back-button:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateX(-2px);
      transition: all 0.2s ease;
    }

    .hero-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .article-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
      font-size: 0.95rem;
      opacity: 0.9;
    }

    .meta-divider {
      height: 16px;
      border-color: rgba(255, 255, 255, 0.4);
    }

    .content-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      transform: translateY(-2rem);
      position: relative;
      z-index: 2;
    }

    .article-content {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-bottom: 3rem;
    }

    .article-image-container {
      position: relative;
      height: 400px;
      overflow: hidden;
    }

    .article-hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .article-hero-image:hover {
      transform: scale(1.05);
    }

    .image-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 100px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
    }

    .article-body {
      padding: 3rem;
    }

    .article-excerpt {
      font-size: 1.2rem;
      font-weight: 500;
      color: #666;
      line-height: 1.6;
      margin-bottom: 2rem;
      padding-left: 1rem;
      border-left: 4px solid #667eea;
    }

    .article-full-content {
      font-size: 1.1rem;
      line-height: 1.8;
      color: #444;
      margin-bottom: 3rem;
    }

    .tags-section {
      margin: 3rem 0;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 1rem;
    }

    .tags-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .custom-chip {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
    }

    .comments-section {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .comments-header {
      margin-bottom: 2rem;
    }

    .comments-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #333;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0;
    }

    .comments-icon {
      color: #667eea;
      font-size: 2rem;
    }

    .comment-form-card {
      margin-bottom: 2rem;
      border: 2px solid #f0f0f0;
      transition: border-color 0.3s ease;
    }

    .comment-form-card:hover {
      border-color: #667eea;
    }

    .comment-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .comment-input {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }

    .post-button {
      padding: 0.75rem 2rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .comment-card {
      border-left: 4px solid #667eea;
      transition: all 0.3s ease;
    }

    .comment-card:hover {
      transform: translateX(4px);
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .comment-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 50%;
      color: white;
    }

    .comment-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .comment-author {
      font-weight: 600;
      color: #333;
    }

    .comment-date {
      font-size: 0.85rem;
      color: #666;
    }

    .comment-content {
      font-size: 1rem;
      line-height: 1.6;
      color: #444;
      padding-left: 3rem;
    }

    .login-prompt {
      display: flex;
      justify-content: center;
    }

    .login-card {
      max-width: 400px;
      text-align: center;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    }

    .login-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .login-icon {
      font-size: 3rem;
      color: #667eea;
    }

    .login-content h3 {
      margin: 0;
      color: #333;
    }

    .login-content p {
      color: #666;
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 1.8rem;
      }

      .article-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .meta-divider {
        display: none;
      }

      .content-container {
        padding: 0 1rem;
      }

      .article-body {
        padding: 2rem 1.5rem;
      }

      .action-buttons {
        flex-direction: column;
        align-items: stretch;
      }

      .comment-content {
        padding-left: 0;
        margin-top: 1rem;
      }

      .hero-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }

    /* Loading Animation */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .article-content,
    .comments-section {
      animation: fadeInUp 0.6s ease-out;
    }

    /* Focus Styles */
    .comment-input textarea:focus {
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    /* Smooth Transitions */
    * {
      transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    }
  `]
})
export class ArticleDetailComponent implements OnInit, OnDestroy {
  article: Article | null = null;
  comments: Comment[] = [];
  articleId: string;
  isAuthenticated = false;
  isAdmin = false;
  userId: string | undefined;
  commentForm: FormGroup;
  private authSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private articleService: ArticleService,
    private commentService: CommentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.articleId = this.route.snapshot.paramMap.get('id')!;
    this.commentForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadArticle();
    this.loadComments();
    this.authSubscription = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
      this.isAdmin = user?.role === 'Admin';
      this.userId = user?._id;
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  loadArticle(): void {
    this.articleService.getArticleById(this.articleId).subscribe({
      next: (article) => this.article = article,
      error: () => this.snackBar.open('Failed to load article', 'Close', { duration: 3000 })
    });
  }

  loadComments(): void {
    this.commentService.getComments(this.articleId).subscribe({
      next: (comments) => this.comments = comments,
      error: () => this.snackBar.open('Failed to load comments', 'Close', { duration: 3000 })
    });
  }

  onCommentSubmit(): void {
    if (this.commentForm.valid) {
      const { content } = this.commentForm.value;
      this.commentService.createComment(content, this.articleId).subscribe({
        next: () => {
          this.commentForm.reset();
          this.loadComments();
          this.snackBar.open('Comment posted successfully!', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Failed to post comment', 'Close', { duration: 3000 })
      });
    }
  }

  canEdit(): boolean {
    let canEdit = false;
    this.authService.user.subscribe(user => {
      canEdit = !!user && (
        user.role === 'Admin' ||
        user.role === 'Editor' ||
        (user.role === 'Writer' && user._id === this.article?.author)
      );
    });
    return canEdit;
  }

  deleteArticle(): void {
    if (this.isAdmin && this.articleId) {
      this.articleService.deleteArticle(this.articleId).subscribe({
        next: () => {
          this.snackBar.open('Article deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/articles']);
        },
        error: () => this.snackBar.open('Failed to delete article', 'Close', { duration: 3000 })
      });
    }
  }

  getExcerpt(content: string): string {
    return content.length > 200 ? content.substring(0, 200) + '...' : content;
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment._id || index.toString();
  }
}