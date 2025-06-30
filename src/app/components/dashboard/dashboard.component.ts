
import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { GridComponent } from '../grid/grid.component';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { OperationHeaderComponent } from '../operation-header/operation-header.component';
import { TabsComponent } from '../tabs/tabs.component';
import { FilterActivitiesComponent } from '../filter-activities/filter-activities.component';
import { HeaderComponent } from '../header/header.component';
import { MiniSidebarComponent } from '../mini-sidebar/mini-sidebar.component';
import { AuthService } from '../../auth/auth.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  // imports: [CommonModule, SidebarComponent, GridComponent,OperationHeaderComponent,TabsComponent,FilterActivitiesComponent],
  imports: [CommonModule, SidebarComponent,OperationHeaderComponent,TabsComponent,HeaderComponent,MiniSidebarComponent],

  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('sidebarRef') sidebarRef!: SidebarComponent;
  @ViewChild(FilterActivitiesComponent) filterActivitiesRef!: FilterActivitiesComponent;

  checkedParents: string[] = [];
  userRole: string = '';
  data: any = {};
  apiService = inject(ApiService);
  isSidebarVisible = true;
  isFilterCollapsed = false;


  constructor(private authService: AuthService) {}
  isMiniSidebarVisible = true;

  ngOnInit(): void {
    const user = this.authService.currentUser;
    this.userRole = user?.role || '';
  }
  onCheckedParentsUpdate(parents: string[]) {
    this.checkedParents = parents;
  }

  toggleMiniSidebar() {
    this.isMiniSidebarVisible = !this.isMiniSidebarVisible;
  }

  expandSidebarFromMini() {
    this.isSidebarVisible = true;
    setTimeout(() => {
      if (this.sidebarRef) {
        this.sidebarRef.isExpanded = true;
      }
    });
  }

  onSidebarClosed() {
    this.isSidebarVisible = false;
  }

  onExpandGridView() {
    this.isSidebarVisible = false;
    if (this.filterActivitiesRef?.expanded) {
      this.filterActivitiesRef.expanded.set(false);
    }
  }


  handleGridExpandCollapse(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
    this.isFilterCollapsed = !this.isFilterCollapsed;
  }

}
