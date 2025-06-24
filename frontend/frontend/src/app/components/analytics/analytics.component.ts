import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, NgChartsModule, MatCardModule, MatToolbarModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  articles: Article[] = [];
  chartData: ChartData<'bar'> = { labels: [], datasets: [] };
  chartType: ChartType = 'bar';
  chartOptions: ChartConfiguration['options'] = {
    scales: { y: { beginAtZero: true, title: { display: true, text: 'Views' } } },
    plugins: { legend: { display: true } }
  };

  constructor(private articleService: ArticleService) {}

  ngOnInit(): void {
    this.articleService.getArticles().subscribe(articles => {
      this.articles = articles;
      this.chartData = {
        labels: articles.map(article => article.title),
        datasets: [{
          label: 'Views',
          data: articles.map(() => Math.floor(Math.random() * 100)), 
          backgroundColor: 'rgba(63, 81, 181, 0.5)',
          borderColor: 'rgba(63, 81, 181, 1)',
          borderWidth: 1
        }]
      };
    });
  }
}