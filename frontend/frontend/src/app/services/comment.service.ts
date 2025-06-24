import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:3002/api/comments';

  constructor(private http: HttpClient) {}

  getComments(articleId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/article/${articleId}`);
  }

createComment(content: string, articleId: string, parentId?: string): Observable<Comment> {
  return this.http.post<Comment>(this.apiUrl, { content, articleId, parentId });
}
}