import {
  Component,
  Input,
  SimpleChanges,
  ChangeDetectorRef,
  HostListener,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GridComponent as KendoGridComponent,
  GridModule,
  PageChangeEvent,  KENDO_GRID_EXCEL_EXPORT, KENDO_GRID
} from '@progress/kendo-angular-grid';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IconsModule } from '@progress/kendo-angular-icons';
import { PagerModule } from '@progress/kendo-angular-pager';
import { DialogModule,DialogThemeColor, KENDO_DIALOGS } from '@progress/kendo-angular-dialog';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_INPUTS } from '@progress/kendo-angular-inputs';
import { KENDO_POPUP } from '@progress/kendo-angular-popup';


@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [
    CommonModule,
    GridModule,
    FormsModule,
    IconsModule,
    PagerModule,
    KENDO_GRID,
    KENDO_GRID_EXCEL_EXPORT,DialogModule, KENDO_DIALOGS,KENDO_BUTTONS, KENDO_INPUTS, KENDO_POPUP
  ],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GridComponent {
  @Input() gridData: any[] = [];
  @ViewChild('grid', { static: false }) grid: any;
  @Output() expandGridClicked = new EventEmitter<void>(); // <-- add this
  private rawData: any[] = [];

  pendingColumnFilters: { [key: string]: Set<string> } = {};


  filteredData: any[] = [];
  pagedData: any[] = [];
  totalCount: number = 0;
  searchTerm: string = '';
  skip: number = 0;
  pageSize: number = 4;
  showExportDialog: boolean = false;
  dialogThemeColor: DialogThemeColor = 'primary';
  filterAnchor: HTMLElement | null = null;
  isCollapsed = false;

  columnFilters: { [key: string]: Set<string> } = {};
  filterPopupVisible = false;
  activeFilterColumn: string | null = null;
  popupPosition = { left: 0, top: 0 };
  filterSearch = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gridData'] && changes['gridData'].currentValue) {
      this.rawData = [...this.gridData];
      this.applyFiltersAndPaging(); // this is key
    }
  }


  loadPagedData(): void {
    // const start = this.skip;
    // const end = this.skip + this.pageSize;
    // this.pagedData = this.filteredData.slice(start, end);
  }

  pageChangeHandler(event: PageChangeEvent): void {
    this.skip = event.skip;
    // this.loadPagedData();
  }

  applySearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredData = this.gridData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(term)
      )
    );
    this.skip = 0;
    // this.loadPagedData();
  }


  applyFiltersAndPaging(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredData = this.rawData.filter(item => {
      const matchesSearch = Object.values(item).some(val =>
        String(val).toLowerCase().includes(term)
      );
      const matchesFilters = Object.entries(this.columnFilters).every(
        ([field, selectedValues]) =>
          selectedValues.size === 0 || selectedValues.has(item[field])
      );
      return matchesSearch && matchesFilters;
    });

    this.totalCount = this.filteredData.length;
    this.skip = 0;
    this.updatePagedData();
  }


  currentPage(): number {
    return Math.floor(this.skip / this.pageSize) + 1;
  }

  pages(): number[] {
    const pageCount = Math.ceil(this.totalCount / this.pageSize);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  onPageClick(page: number): void {
    this.skip = (page - 1) * this.pageSize;
    this.updatePagedData();
  }

  onFirst(): void {
    this.skip = 0;
    this.updatePagedData();
  }

  onPrev(): void {
    if (this.skip >= this.pageSize) {
      this.skip -= this.pageSize;
      this.updatePagedData();
    }
  }

  onNext(): void {
    if (this.skip + this.pageSize < this.totalCount) {
      this.skip += this.pageSize;
      this.updatePagedData();
    }
  }

  onLast(): void {
    const lastPageSkip = (Math.ceil(this.totalCount / this.pageSize) - 1) * this.pageSize;
    this.skip = lastPageSkip;
    this.updatePagedData();
  }

  updatePagedData(): void {
    const start = this.skip;
    const end = start + this.pageSize;
    this.pagedData = this.filteredData.slice(start, end);
  }

  // openFilterPopup(column: string, event: MouseEvent): void {
  //   event.stopPropagation();
  //   this.activeFilterColumn = column;
  //   this.filterSearch = '';
  //   this.filterPopupVisible = true;

  //   this.filterAnchor = event.currentTarget as HTMLElement;

  //   if (!this.columnFilters[column]) {
  //     this.columnFilters[column] = new Set<string>();
  //   }

  //   setTimeout(() => {
  //     const input = document.querySelector('.popup-search-box input') as HTMLInputElement;
  //     input?.focus();
  //   }, 0);
  // }

  openFilterPopup(column: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeFilterColumn = column;
    this.filterSearch = '';
    this.filterPopupVisible = true;
    this.filterAnchor = event.currentTarget as HTMLElement;

    // Copy active filter state to pending
    const currentSet = this.columnFilters[column] || new Set<string>();
    this.pendingColumnFilters[column] = new Set(currentSet);

    setTimeout(() => {
      const input = document.querySelector('.popup-search-box input') as HTMLInputElement;
      input?.focus();
    }, 0);
  }


  closeFilterPopup(): void {
    this.filterPopupVisible = false;
    this.filterAnchor = null;
    this.activeFilterColumn = null;
  }


  getUniqueColumnValues(field: string): string[] {
    const values = this.gridData.map((item) => item[field]);
    return [...new Set(values)];
  }

  getFilteredPopupOptions(): string[] {
    const allOptions = this.getUniqueColumnValues(this.activeFilterColumn!);
    return allOptions.filter((opt) =>
      opt?.toLowerCase().includes(this.filterSearch.toLowerCase())
    );
  }

  // toggleFilterSelection(value: string): void {
  //   if (!this.activeFilterColumn) return;
  //   const set = this.columnFilters[this.activeFilterColumn];
  //   set.has(value) ? set.delete(value) : set.add(value);
  // }


  toggleFilterSelection(value: string): void {
    if (!this.activeFilterColumn) return;

    const set = this.pendingColumnFilters[this.activeFilterColumn];
    if (!set) return;

    set.has(value) ? set.delete(value) : set.add(value);
  }

  // applyColumnFilter(): void {
  //   this.applyFiltersAndPaging();
  //   this.closeFilterPopup();
  // }

  applyColumnFilter(): void {
    if (this.activeFilterColumn) {
      const pending = this.pendingColumnFilters[this.activeFilterColumn];
      this.columnFilters[this.activeFilterColumn] = new Set(pending); // apply selected filters
    }

    this.applyFiltersAndPaging();
    this.closeFilterPopup();
  }


  // clearColumnFilter(): void {
  //   if (this.activeFilterColumn) {
  //     this.columnFilters[this.activeFilterColumn] = new Set<string>();
  //   }
  //   this.applyFiltersAndPaging();
  // }

  clearColumnFilter(): void {
    if (this.activeFilterColumn) {
      this.pendingColumnFilters[this.activeFilterColumn] = new Set<string>();
    }
  }


  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.filter-popup') &&
      !target.classList.contains('fa-filter')
    ) {
      this.closeFilterPopup();
    }
  }

  openExportDialog(): void {
    this.showExportDialog = true;
  }

  onDialogClose(confirmed: boolean): void {
    this.showExportDialog = false;
    if (confirmed && this.grid) {
      this.grid.saveAsExcel();
    }
  }

  onExpandClick(): void {
    this.isCollapsed = !this.isCollapsed;
    this.expandGridClicked.emit();
  }

}
