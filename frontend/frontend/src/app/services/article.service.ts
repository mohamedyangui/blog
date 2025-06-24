import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from '../models/article';
import { Comment } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = 'http://localhost:3002/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `${token}` : '',
    });
  }

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiUrl);
  }

  getArticleById(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }

  createArticle(article: Partial<Article>): Observable<Article> {
    return this.http.post<Article>(this.apiUrl, article, { headers: this.getHeaders() });
  }

  updateArticle(id: string, article: Partial<Article>): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/${id}`, article, { headers: this.getHeaders() });
  }

  deleteArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createComment(content: string, articleId: string, parentId?: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/comments`, { content, articleId, parentId }, { headers: this.getHeaders() });
  }

  getComments(articleId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/comments/${articleId}`);
  }
}