import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';
import { Article } from '../../models/article';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    RouterLink,
    DatePipe,
    FormsModule
  ],
  template: `
    <div class="page-container">
      <!-- Hero Header -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              Discover Amazing Articles
            </h1>
            <p class="hero-subtitle">
              Explore our collection of insightful articles and stories
            </p>
          </div>
          
          <!-- Search Bar -->
          <div class="search-section">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search articles...</mat-label>
              <input matInput 
                     [(ngModel)]="searchTerm" 
                     (input)="onSearch()"
                     placeholder="What are you looking for?">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <!-- Create Article Button -->
          <div class="hero-actions" *ngIf="isAuthenticated">
            <button 
              mat-fab 
              extended 
              color="accent" 
              [routerLink]="['/article/new']"
              class="create-button"
            >
              Create New Article
            </button>
          </div>
        </div>
        
        <!-- Animated Background Elements -->
        <div class="floating-elements">
          <div class="floating-element" style="--delay: 0s; --duration: 20s;"></div>
          <div class="floating-element" style="--delay: -5s; --duration: 25s;"></div>
          <div class="floating-element" style="--delay: -10s; --duration: 30s;"></div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="content-section">
        <!-- Loading State -->
        <div class="loading-container" *ngIf="loading">
          <mat-spinner></mat-spinner>
          <p>Loading amazing articles...</p>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!loading && filteredArticles.length === 0">
          <mat-icon class="empty-icon">article</mat-icon>
          <h3>No Articles Found</h3>
          <p *ngIf="searchTerm">No articles match your search for "{{ searchTerm }}"</p>
          <p *ngIf="!searchTerm">No articles available yet.</p>
          <button 
            mat-raised-button 
            color="primary" 
            [routerLink]="['/article/new']"
            *ngIf="isAuthenticated && !searchTerm"
          >
            <mat-icon>add</mat-icon>
            Create First Article
          </button>
        </div>

        <!-- Articles Grid -->
        <div class="articles-grid" *ngIf="!loading && filteredArticles.length > 0">
          <article 
            *ngFor="let article of filteredArticles; trackBy: trackByArticleId" 
            class="article-card-container"
          >
            <mat-card class="article-card" [routerLink]="['/articles', article._id]">
              <!-- Article Image -->
              <div class="card-image-container">
                <img 
                  *ngIf="article.image" 
                  [src]="article.image" 
                  [alt]="article.title"
                  class="card-image"
                  loading="lazy"
                >
                <div 
                  *ngIf="!article.image" 
                  class="placeholder-image"
                >
                  <mat-icon>article</mat-icon>
                </div>
                <div class="image-overlay">
                  <div class="reading-time">
                    <mat-icon>schedule</mat-icon>
                    {{ getReadingTime(article.content) }} min read
                  </div>
                </div>
              </div>

              <!-- Card Content -->
              <div class="card-content">
                <mat-card-header class="card-header">
                  <mat-card-title class="card-title">
                    {{ article.title }}
                  </mat-card-title>
                  <mat-card-subtitle class="card-date">
                    <mat-icon class="date-icon">schedule</mat-icon>
                    {{ article.createdAt | date: 'MMM d, yyyy' }}
                  </mat-card-subtitle>
                </mat-card-header>

                <mat-card-content class="card-description">
                  <p>{{ getExcerpt(article.content) }}</p>
                </mat-card-content>

                <!-- Tags -->
                <div class="tags-section" *ngIf="article.tags && article.tags.length > 0">
                  <mat-chip-set class="tags-container">
                    <mat-chip 
                      *ngFor="let tag of article.tags.slice(0, 3)" 
                      class="tag-chip"
                    >
                      {{ tag }}
                    </mat-chip>
                    <mat-chip 
                      *ngIf="article.tags.length > 3" 
                      class="more-tags-chip"
                    >
                      +{{ article.tags.length - 3 }}
                    </mat-chip>
                  </mat-chip-set>
                </div>

                <!-- Card Actions -->
                <mat-card-actions class="card-actions">
                  <div class="author-info">
                    <mat-icon class="author-icon">person</mat-icon>
                    <span class="author-name">{{ article.author || 'Anonymous' }}</span>
                  </div>
                  <button 
                    mat-icon-button 
                    class="read-more-button"
                    [attr.aria-label]="'Read article: ' + article.title"
                  >
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </mat-card-actions>
              </div>
            </mat-card>
          </article>
        </div>

        <!-- Load More Button -->
        <div class="load-more-section" *ngIf="!loading && filteredArticles.length > 0 && hasMoreArticles">
          <button 
            mat-raised-button 
            color="primary" 
            (click)="loadMoreArticles()"
            class="load-more-button"
          >
            <mat-icon>expand_more</mat-icon>
            Load More Articles
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .hero-section {
      position: relative;
      padding: 4rem 2rem;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
      color: white;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
      text-align: center;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .hero-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
    }

    .hero-subtitle {
      font-size: 1.3rem;
      opacity: 0.9;
      margin: 0 0 3rem 0;
      font-weight: 300;
    }

    .search-section {
      max-width: 500px;
      margin: 0 auto 2rem;
    }

    .search-field {
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50px;
      backdrop-filter: blur(10px);
    }

    .search-field ::ng-deep .mat-mdc-form-field-input-control input {
      color: white;
    }

    .search-field ::ng-deep .mat-mdc-form-field-input-control input::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    .search-field ::ng-deep .mdc-notched-outline__leading,
    .search-field ::ng-deep .mdc-notched-outline__trailing,
    .search-field ::ng-deep .mdc-notched-outline__notch {
      border-color: rgba(255, 255, 255, 0.3);
    }

    .search-field ::ng-deep .mat-mdc-form-field-label {
      color: rgba(255, 255, 255, 0.9);
    }

    .hero-actions {
      margin-top: 2rem;
    }

    .create-button {
      padding: 0.75rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
    }

    .create-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
    }

    .floating-elements {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
    }

    .floating-element {
      position: absolute;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float var(--duration, 20s) var(--delay, 0s) infinite linear;
    }

    .floating-element:nth-child(1) {
      width: 80px;
      height: 80px;
      left: 10%;
      top: 20%;
    }

    .floating-element:nth-child(2) {
      width: 120px;
      height: 120px;
      right: 10%;
      top: 60%;
    }

    .floating-element:nth-child(3) {
      width: 60px;
      height: 60px;
      left: 70%;
      top: 10%;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotateZ(0deg); }
      33% { transform: translateY(-30px) rotateZ(120deg); }
      66% { transform: translateY(15px) rotateZ(240deg); }
    }

    .content-section {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      transform: translateY(-2rem);
      position: relative;
      z-index: 2;
    }

    .loading-container {
      text-align: center;
      padding: 4rem 2rem;
      color: white;
    }

    .loading-container p {
      margin-top: 1rem;
      font-size: 1.1rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .empty-state p {
      color: #666;
      margin-bottom: 2rem;
    }

    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
      padding: 2rem 0;
    }

    .article-card-container {
      animation: fadeInUp 0.6s ease-out;
      animation-fill-mode: both;
    }

    .article-card-container:nth-child(1) { animation-delay: 0.1s; }
    .article-card-container:nth-child(2) { animation-delay: 0.2s; }
    .article-card-container:nth-child(3) { animation-delay: 0.3s; }
    .article-card-container:nth-child(4) { animation-delay: 0.4s; }
    .article-card-container:nth-child(5) { animation-delay: 0.5s; }
    .article-card-container:nth-child(6) { animation-delay: 0.6s; }

    .article-card {
      height: 100%;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 1rem;
      overflow: hidden;
      background: white;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
    }

    .article-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }

    .card-image-container {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .article-card:hover .card-image {
      transform: scale(1.05);
    }

    .placeholder-image {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .placeholder-image mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #999;
    }

    .image-overlay {
      position: absolute;
      top: 0;
      right: 0;
      padding: 0.75rem;
    }

    .reading-time {
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      backdrop-filter: blur(10px);
    }

    .reading-time mat-icon {
      font-size: 0.9rem;
      width: 0.9rem;
      height: 0.9rem;
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
    }

    .card-header {
      margin-bottom: 1rem;
    }

    .card-title {
      font-size: 1.3rem;
      font-weight: 600;
      line-height: 1.3;
      margin-bottom: 0.5rem;
      color: #333;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-date {
      color: #666;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .date-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .card-description {
      flex: 1;
      margin-bottom: 1rem;
    }

    .card-description p {
      color: #555;
      line-height: 1.6;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tags-section {
      margin-bottom: 1rem;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag-chip {
      font-size: 0.75rem;
      height: 28px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 14px;
    }

    .more-tags-chip {
      font-size: 0.75rem;
      height: 28px;
      background: #f0f0f0;
      color: #666;
      border-radius: 14px;
    }

    .card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0;
      margin-top: auto;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.9rem;
    }

    .author-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }

    .read-more-button {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      transition: all 0.3s ease;
    }

    .read-more-button:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .load-more-section {
      text-align: center;
      padding: 2rem 0;
    }

    .load-more-button {
      padding: 0.75rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      background: white;
      color: #667eea;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .load-more-button:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
    }

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

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .hero-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
      }

      .hero-subtitle {
        font-size: 1.1rem;
      }

      .articles-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 1rem 0;
      }

      .content-section {
        padding: 0 1rem;
      }

      .hero-section {
        padding: 2rem 1rem;
      }
    }

    @media (max-width: 480px) {
      .card-content {
        padding: 1rem;
      }

      .hero-title {
        font-size: 1.5rem;
      }

      .create-button {
        font-size: 1rem;
        padding: 0.6rem 1.5rem;
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .article-card {
        border: 2px solid #333;
      }

      .tag-chip {
        background: #333;
        color: white;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      .floating-element {
        animation: none;
      }
    }
  `]
})
export class ArticleListComponent implements OnInit, OnDestroy {
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  isAuthenticated = false;
  loading = true;
  searchTerm = '';
  hasMoreArticles = false;
  private authSubscription: Subscription;

  constructor(
    private articleService: ArticleService, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadArticles();
    this.authSubscription = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadArticles(): void {
    this.loading = true;
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.filteredArticles = articles;
        this.loading = false;
        this.hasMoreArticles = articles.length >= 10;
      },
      error: (error) => {
        console.error('Error loading articles:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredArticles = this.articles;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredArticles = this.articles.filter(article => 
      article.title.toLowerCase().includes(term) ||
      article.content.toLowerCase().includes(term) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  }

  getExcerpt(content: string): string {
    const maxLength = 120;
    if (content.length <= maxLength) return content;
    
    const truncated = content.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }

  getReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  trackByArticleId(index: number, article: Article): string {
    return article._id || index.toString();
  }

  loadMoreArticles(): void {
    console.log('Loading more articles...');
    this.hasMoreArticles = false;
  }
}