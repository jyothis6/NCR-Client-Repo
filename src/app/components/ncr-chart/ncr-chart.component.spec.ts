import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NcrChartComponent } from './ncr-chart.component';

describe('NcrChartComponent', () => {
  let component: NcrChartComponent;
  let fixture: ComponentFixture<NcrChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NcrChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NcrChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
