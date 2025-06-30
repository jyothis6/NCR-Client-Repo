import { Component } from '@angular/core';
import { KENDO_LAYOUT } from "@progress/kendo-angular-layout";
import { NcrChartComponent } from '../ncr-chart/ncr-chart.component';
@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [KENDO_LAYOUT,NcrChartComponent],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent {

}
