import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  articles: Article[] = [];
  chartData: ChartData<'bar'> = { labels: [], datasets: [] };
  chartType: ChartType = 'bar';
  chartOptions: ChartConfiguration['options'] = {
    scales: { y: { beginAtZero: true } }
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
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      };
    });
  }
}