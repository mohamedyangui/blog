import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { Article } from '../../models/article';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatToolbarModule,
    RouterLink
  ],
  template: `
    <div class="container">
      <mat-toolbar color="primary">
        <span>{{ isEditMode ? 'Edit Article' : 'Create Article' }}</span>
      </mat-toolbar>
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="articleForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title">
              <mat-error *ngIf="articleForm.get('title')?.hasError('required')">
                Title is required
              </mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Content</mat-label>
              <textarea matInput formControlName="content" rows="6"></textarea>
              <mat-error *ngIf="articleForm.get('content')?.hasError('required')">
                Content is required
              </mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Image URL</mat-label>
              <input matInput formControlName="image">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tags</mat-label>
              <mat-chip-grid #chipGrid aria-label="Tags">
                <mat-chip-row *ngFor="let tag of tags" (removed)="removeTag(tag)">
                  {{ tag }}
                  <button matChipRemove>
                    <mat-icon>cancel</mat-icon>
                  </button>
                </mat-chip-row>
                <input [matChipInputFor]="chipGrid" (matChipInputTokenEnd)="addTag($event)">
              </mat-chip-grid>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="articleForm.invalid">
              {{ isEditMode ? 'Update' : 'Create' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 16px auto;
      padding: 16px;
    }
    .form-card {
      padding: 16px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class ArticleFormComponent implements OnInit {
  articleForm!: FormGroup;
  isEditMode = false;
  articleId: string | null = null;
  tags: string[] = [];

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      image: [''],
      tags: ['']
    });
    this.articleId = this.route.snapshot.paramMap.get('id');
    if (this.articleId) {
      this.isEditMode = true;
      this.loadArticle();
    }
  }

  loadArticle(): void {
    if (this.articleId) {
      this.articleService.getArticleById(this.articleId).subscribe(article => {
        this.tags = article.tags || [];
        this.articleForm.patchValue({
          title: article.title,
          content: article.content,
          image: article.image
        });
      });
    }
  }

  addTag(event: any): void {
    const value = (event.value || '').trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }
    event.chipInput?.clear();
    this.articleForm.get('tags')?.setValue('');
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.articleForm.valid) {
      const article: Partial<Article> = {
        ...this.articleForm.value,
        tags: this.tags
      };
      if (this.isEditMode && this.articleId) {
        this.articleService.updateArticle(this.articleId, article).subscribe({
          next: () => {
            this.snackBar.open('Article updated', 'Close', { duration: 3000 });
            this.router.navigate(['/articles']);
          },
          error: (err) => this.snackBar.open(err.message || 'Failed to update article', 'Close', { duration: 3000 })
        });
      } else {
        this.articleService.createArticle(article).subscribe({
          next: () => {
            this.snackBar.open('Article created', 'Close', { duration: 3000 });
            this.router.navigate(['/articles']);
          },
          error: (err) => this.snackBar.open(err.message || 'Failed to create article', 'Close', { duration: 3000 })
        });
      }
    } else {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
    }
  }
}