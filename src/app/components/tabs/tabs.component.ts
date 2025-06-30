import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { TabStripModule } from '@progress/kendo-angular-layout';
import { FilterActivitiesComponent } from '../filter-activities/filter-activities.component';
import { GridComponent } from '../grid/grid.component';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { NotificationService } from '@progress/kendo-angular-notification';
import { NcrChartComponent } from '../ncr-chart/ncr-chart.component';
import { ChartComponent } from '../chart/chart.component';
import { Activity } from '../../models/activity.model'; // adjust path if needed



@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [CommonModule,TabStripModule,FilterActivitiesComponent,NotificationModule,NcrChartComponent,GridComponent],

  encapsulation: ViewEncapsulation.None
})
export class TabsComponent {
  activeTab: string = 'NCR';  // Default tab
  @ViewChild('searchInput') searchInput!: ElementRef;
  @Input() checkedParents: string[] = [];
  @Output() collapseSidebarAndFilter = new EventEmitter<void>();
  @Input() isFilterCollapsed = false;


  showNotification = true;
  responseData: any = {};
  apiService = inject(ApiService);
  viewMode = 'Tabular';
  selectedType = 'Individual'; // default
  data: { activities: Activity[] } = { activities: [] };
  constructor(private cdr: ChangeDetectorRef,private notificationService: NotificationService) {}
  setActive(tab: string) {
    this.activeTab = tab;
  }

  closeNotification() {
    this.showNotification = false;
    this.notificationService.show({
      content: 'Notification dismissed!',
      type: { style: 'info', icon: true },
      animation: { type: 'fade', duration: 500 },
      position: { horizontal: 'right', vertical: 'top' }
    });
  }


  ngOnInit() {
    this.fetchData();
    this.setActive(this.activeTab)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['checkedParents']) {
      console.log('Updated checked parents:', this.checkedParents);
    }
  }
  fetchData() {
    forkJoin({
      // contracts: this.apiService.fetchContracts(),
      activities: this.apiService.fetchActivities()
    }).subscribe(response => {
      this.data.activities = response.activities ?? [];
    });
  }

  performSearch() {
    console.log('Searching:', this.searchInput.nativeElement.value);
  }

  onViewModeChanged(mode: string) {
    this.viewMode = mode;
  }
  onTypeChanged(type: string) {
    this.selectedType = type;
  }

  getCheckedParentLabels(truncate: boolean = false): string {
    const label = this.checkedParents.join(' / ');
    return truncate && label.length > 100 ? label.slice(0, 100) + '...' : label;
  }

  get filteredGridData(): Activity[] {
    return this.data.activities.filter((a: Activity) => a.type === this.selectedType);
  }


}
