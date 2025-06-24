export interface Comment {
  _id: string;
  content: string;
  author: string;
  article: string;
  parent?: string;
  children: Comment[];
  createdAt: Date;
}