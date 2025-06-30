
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TabStripModule } from '@progress/kendo-angular-layout';
import { of, delay, Observable } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';
import { MultiSelectModule } from '@progress/kendo-angular-dropdowns';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { MenuItem, MenuModule, MenuSelectEvent } from '@progress/kendo-angular-menu';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  imports: [CommonModule, FormsModule, TreeViewModule, TabStripModule,MultiSelectModule, MenuModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SidebarComponent {
  isExpanded = true;
  searchTerm = '';
  filteredData: any[] = [];
  checkedKeys: any[] = [];
  contractTreeData: any[] = [];
  allContracts: any[] = [];
  myContracts: any[] = [];
  favoritesSet: Set<number> = new Set();
  expandedKeys: any[] = [];
// Advanced Search Fields
showAdvanceSearch = false;

deliveryYears: string[] = [];
racYears: string[] = [];
projectStatuses: string[] = [];

selectedDeliveryYears: string[] = [];
selectedRacYears: string[] = [];
selectedProjectStatuses: string[] = [];
showDialog = false;

  @Output() checkedParentsChange = new EventEmitter<string[]>();
  @Output() sidebarClosed = new EventEmitter<void>();
  @ViewChild('sidebarMenuButton', { static: false }) sidebarMenuButton!: ElementRef;

showSidebarMenu = false;
hideMenuTimeout: any;
  menuAnchor: any;
showMainMenu = false;
showLoadFilterMenu = false;

savedFilters = ['Saved Filter 1', 'Saved Filter 2', 'Saved Filter 3'];


  tabs = [
    { key: 'my', label: 'My Contracts' },
    { key: 'all', label: 'All Contracts' },
    { key: 'favorites', label: 'Favorites' },
  ];

  activeTab = 'my';

  constructor(private http: HttpClient, private apiService:ApiService) {
    this.loadContracts();
  }


  toggleMainMenu(anchor: any) {
    this.menuAnchor = anchor;
    this.showMainMenu = !this.showMainMenu;
    this.showLoadFilterMenu = false;
  }

  toggleLoadFilterMenu() {
    this.showLoadFilterMenu = !this.showLoadFilterMenu;
  }

  closeMenus() {
    this.showMainMenu = false;
    this.showLoadFilterMenu = false;
  }



  sidebarMenuItems: MenuItem[] = [
    { text: 'Export Contracts', icon: 'download' },
    { text: 'Save Filter', icon: 'save' },
    {
      text: 'Load Filter',
      icon: 'filter',
      items: this.savedFilters.map(filter => ({ text: filter }))
    },
    { text: 'Instructions to Use', icon: 'question' }
  ];

  toggleSidebarMenu() {
    this.showSidebarMenu = !this.showSidebarMenu;
  }

  hideSidebarMenuWithDelay() {
    this.hideMenuTimeout = setTimeout(() => {
      this.showSidebarMenu = false;
    }, 1500);
  }

  onSidebarMenuSelect(event: MenuSelectEvent): void {
    console.log('Selected item:', event.item.text);
    this.showSidebarMenu = false;
  }



  exportData() {
    console.log('Exporting data...');
    this.closeMenus();
  }

  openContracts() {
    console.log('Opening contracts...');
    this.closeMenus();
  }

  saveFilter() {
    console.log('Saving current filter...');
    this.closeMenus();
  }

  showInstruction() {
    console.log('Showing instructions...');
    this.closeMenus();
  }

  loadSavedFilter(filter: string) {
    console.log('Loading filter:', filter);
    this.closeMenus();
  }


  toggleAdvanceSearch() {
    this.showAdvanceSearch = !this.showAdvanceSearch;
  }

  // Reset Filters
  clearAllFilters(event: Event): void {
    event.stopPropagation();
    this.selectedDeliveryYears = [];
    this.selectedRacYears = [];
    this.selectedProjectStatuses = [];
    this.applyFilters();

  }

  setFilterOptions() {
    this.deliveryYears = ['2021', '2022', '2023', '2024'];
    this.racYears = ['2021', '2022', '2023'];
    this.projectStatuses = ['Active', 'Planned', 'Hold', 'Completed'];
  }

  loadContracts() {
    forkJoin({

      myContractData: this.apiService.fetchMyContracts(),
      allContractData: this.apiService.fetchAllContracts()
    }).subscribe(response => {
      this.allContracts= response.allContractData;
      this.myContracts = response.myContractData;
      this.setActiveTab('my');
    });

    this.setFilterOptions();
  }

ngOnChanges(): void {
  this.applyFilters();
}

// ngDoCheck(): void {
//   this.applyFilters();
// }


// applyFilters() {
//   let baseData = this.contractTreeData;

//   this.filteredData = baseData.filter(item => {
//     const matchesDeliveryYear = this.selectedDeliveryYears.length === 0 || this.selectedDeliveryYears.includes(item.deliveryYear);
//     const matchesRacYear = this.selectedRacYears.length === 0 || this.selectedRacYears.includes(item.racYear);
//     const matchesStatus = this.selectedProjectStatuses.length === 0 || this.selectedProjectStatuses.includes(item.status);

//     return matchesDeliveryYear && matchesRacYear && matchesStatus;
//   });
// }

applyFilters() {
  const term = this.searchTerm.trim().toLowerCase();

  const filterRecursive = (nodes: any[], level = 0): any[] => {
    const result: any[] = [];

    for (const node of nodes) {
      const deliveryMatch =
        level === 0 ? (this.selectedDeliveryYears.length === 0 || this.selectedDeliveryYears.includes(node.deliveryYear)) : true;

      const racMatch =
        level === 0 ? (this.selectedRacYears.length === 0 || this.selectedRacYears.includes(node.racYear)) : true;

      const statusMatch =
        level === 0 ? (this.selectedProjectStatuses.length === 0 || this.selectedProjectStatuses.includes(node.status)) : true;

      const nameMatch = !term || node.name?.toLowerCase().includes(term);

      // Only allow children if parent matched all filters
      const parentMatches = deliveryMatch && racMatch && statusMatch && nameMatch;

      const matchedChildren = parentMatches && node.children
        ? filterRecursive(node.children, level + 1)
        : [];

      if (parentMatches) {
        result.push({
          ...node,
          children: matchedChildren.length > 0 ? matchedChildren : undefined
        });
      }
    }

    return result;
  };

  this.filteredData = filterRecursive(this.contractTreeData);
  console.log('✅ Filtered Data:', this.filteredData);
}








  onCheckChange(): void {
    const allNodes = this.flattenTree(this.contractTreeData);
    console.log('allNodes:', allNodes);
    console.log('checkedKeys:', this.checkedKeys);

    const checkedKeysAsNumbers = this.checkedKeys.map(key => Number(key));

    const checkedParentNames = allNodes
  .filter(item => checkedKeysAsNumbers.includes(item.id))
  .map(item => item.name ?? item.text ?? 'Unknown');

    console.log('Checked Parent Names:', checkedParentNames);
    this.checkedParentsChange.emit(checkedParentNames);
  }


  flattenTree(nodes: any[], flatList: any[] = []): any[] {
    for (const node of nodes) {
      flatList.push(node);
      if (node.children) {
        this.flattenTree(node.children, flatList);
      }
    }
    return flatList;
  }

  setActiveTab(tabKey: string) {
    this.activeTab = tabKey;
    this.searchTerm = '';
    this.expandedKeys = [];
    this.checkedKeys = [];

    if (tabKey === 'my') {
      this.contractTreeData = this.myContracts;
    } else if (tabKey === 'all') {
      this.contractTreeData = this.allContracts;
    } else {
      this.contractTreeData = this.getFavoriteTree();
    }

    this.filteredData = [...this.contractTreeData];
  }


toggleSidebar() {
  this.sidebarClosed.emit();
}

  fetchChildren = (dataItem: any): Observable<any[]> => {
    return of(dataItem.children || []).pipe(delay(300));
  };

  hasChildren = (dataItem: any): boolean => dataItem.hasChildren;

  onExpand(event: any): void {
    const clickedNode = event.item.dataItem;
    this.expandedKeys = [clickedNode.id];
  }

  onCollapse(event: any): void {
    const collapsedNode = event.item.dataItem;
    this.expandedKeys = this.expandedKeys.filter(id => id !== collapsedNode.id);
  }


  onSearch(): void {
    this.applyFilters();
  }


  isParentNode(item: any): boolean {
    return item.hasChildren || (item.children && item.children.length > 0);
  }



  filterTree(items: any[], term: string): any[] {
    const filtered: any[] = [];
    for (const item of items) {
      const nameMatch = item.name.toLowerCase().includes(term);
      let children: any[] = [];
      if (item.children) {
        children = this.filterTree(item.children, term);
      }
      if (nameMatch || children.length) {
        filtered.push({ ...item, children });
      }
    }
    return filtered;
  }

  toggleFavorite(item: any) {
    if (this.favoritesSet.has(item.id)) {
      this.favoritesSet.delete(item.id);
    } else {
      this.favoritesSet.add(item.id);
    }

    if (this.activeTab === 'favorites') {
      this.setActiveTab('favorites');
    }
  }

  isFavorite(item: any): boolean {
    return this.favoritesSet.has(item.id);
  }

  getFavoriteTree(): any[] {
    const flatList: any[] = [];

    const collectFavorites = (nodes: any[]) => {
      for (const node of nodes) {
        if (this.favoritesSet.has(node.id)) {
          flatList.push({ ...node });
        }
        if (node.children) {
          collectFavorites(node.children);
        }
      }
    };

    this.allContracts.forEach(contract => collectFavorites([contract]));
    return flatList;
  }


}
