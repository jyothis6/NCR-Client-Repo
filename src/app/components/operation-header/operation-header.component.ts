import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomDatePipe } from '../../custom-date.pipe';
import { KENDO_GAUGES } from '@progress/kendo-angular-gauges';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';

@Component({
  selector: 'app-operation-header',
  standalone: true,
  imports: [
    CommonModule,
    CustomDatePipe,
    KENDO_GAUGES,
    KENDO_BUTTONS
  ],
  templateUrl: './operation-header.component.html',
  styleUrls: ['./operation-header.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OperationHeaderComponent {
  lastUpdated = new Date();
  completion = 71;
  kaizenUrl='https://nestdigital.com/';
  public colors = [
    { to: 25, color: '#0058e9' },
    { from: 25, to: 50, color: '#37b400' },
    { from: 50, to: 75, color: '#007a5e' },
    { from: 75, color: '#f31700' }
  ];

  radius = 16;
  circumference = 2 * Math.PI * this.radius;
}
