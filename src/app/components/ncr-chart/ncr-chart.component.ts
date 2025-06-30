import { Component, signal, computed, CUSTOM_ELEMENTS_SCHEMA,  HostListener, ViewChild, EventEmitter, Output, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule, SeriesClickEvent,  KENDO_CHARTS,
  LabelRotation,
  SeriesType } from '@progress/kendo-angular-charts';
import { GridModule, KENDO_GRID, KENDO_GRID_EXCEL_EXPORT } from '@progress/kendo-angular-grid';
// import { sampleChartData, sampleTableData } from '../../services/ncr-mock-data';
import { FormsModule } from '@angular/forms';
import { KENDO_POPUP } from '@progress/kendo-angular-popup';
import { DialogModule,DialogThemeColor, KENDO_DIALOGS } from '@progress/kendo-angular-dialog';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { KENDO_INPUTS } from '@progress/kendo-angular-inputs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';


@Component({
  selector: 'app-ncr-chart',
  standalone: true,
  imports: [CommonModule, ChartModule, GridModule,KENDO_CHARTS,FormsModule,  KENDO_GRID,KENDO_POPUP,DialogModule, KENDO_DIALOGS,KENDO_BUTTONS, KENDO_INPUTS,
    KENDO_GRID_EXCEL_EXPORT],
  templateUrl: './ncr-chart.component.html',
  styleUrl: './ncr-chart.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class NcrChartComponent {

  constructor(private apiService: ApiService) {
    this.loadChartData();
    this.loadTableData();
  }

  public chartData = signal<any[]>([]);
  public tableData = signal<any[]>([]);
  public filteredData = signal<any[]>([]);

  filterAnchor: HTMLElement | null = null;
  isCollapsed = false;
  public showTableView = signal(false);
  public selectedMonth = signal('');
  showExportDialog: boolean = false;
  dialogThemeColor: DialogThemeColor = 'primary';
  public pageSize = 10;
  public skip = signal(0);
  private isFilterBaseInitialized = false;

  columnFilters: { [key: string]: Set<string> } = {};
  filterPopupVisible = false;
  activeFilterColumn: string | null = null;
  popupPosition = { left: 0, top: 0 };
  filterSearch = '';
  private originalFilteredData: any[] = [];





  @ViewChild('grid', { static: false }) grid: any;
  @Output() expandGridClicked = new EventEmitter<void>();

  loadChartData() {
    this.apiService.fetchChartData().subscribe({
      next: (data) => this.chartData.set(data),
      error: (err) => console.error('Chart data load failed:', err)
    });
  }

  loadTableData() {
    this.apiService.fetchTableData().subscribe({
      next: (data) => {
        this.tableData.set(data);
        this.filteredData.set(data);
      },
      error: (err) => console.error('Table data load failed:', err)
    });
  }

  public pagedChartData = computed(() =>
    this.chartData().slice(this.skip(), this.skip() + this.pageSize)
  );
// public chartCategories = computed(() => this.chartData().map(d => d.monthYear));
  public chartCategories = computed(() =>
    this.pagedChartData().map(d => {
      const [year, month] = d.monthYear.split(' ');
      return `${year}\n${month}`;
    })
  );

  public chartCounts = computed(() =>
    this.pagedChartData().map(d => d.count)
  );

  public totalPages = computed(() =>
    Math.ceil(this.chartData().length / this.pageSize)
  );

  public currentPage = computed(() =>
    Math.floor(this.skip() / this.pageSize) + 1
  );

  public onPrev(): void {
    if (this.skip() > 0) {
      this.skip.set(this.skip() - this.pageSize);
    }
  }

  public onNext(): void {
    if (this.skip() + this.pageSize < this.chartData().length) {
      this.skip.set(this.skip() + this.pageSize);
    }
  }

  public pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const window = 5;
    const half = Math.floor(window / 2);
    let start = Math.max(current - half, 1);
    let end = Math.min(start + window - 1, total);

    if (end - start < window - 1) {
      start = Math.max(end - window + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  public onPageClick(page: number): void {
    this.skip.set((page - 1) * this.pageSize);
  }

  public onFirst(): void {
    this.skip.set(0);
  }

  public onLast(): void {
    const lastSkip = (this.totalPages() - 1) * this.pageSize;
    this.skip.set(lastSkip);
  }


  onExpandClick(): void {
    this.isCollapsed = !this.isCollapsed;
    this.expandGridClicked.emit();
  }

  onSeriesClick(e: SeriesClickEvent): void {
    const category = (e.category as string).replace('\n', ' ');
    this.selectedMonth.set(category);
    const result = this.tableData().filter(item => item.monthYear === category);
    this.filteredData.set(result);

    this.originalFilteredData = [...result];
    this.isFilterBaseInitialized = true;

    this.showTableView.set(true);
  }


  public closeTableView(): void {
    this.showTableView.set(false);
    this.selectedMonth.set('');
  }


  openFilterPopup(column: string, event: MouseEvent): void {
    event.stopPropagation();

    this.activeFilterColumn = column;
    this.filterSearch = '';
    this.filterPopupVisible = true;
    this.filterAnchor = event.currentTarget as HTMLElement;
    if (!this.isFilterBaseInitialized) {
      this.originalFilteredData = [...this.filteredData()];
      this.isFilterBaseInitialized = true;
    }

    if (!this.columnFilters[column]) {
      this.columnFilters[column] = new Set<string>();
    }

    setTimeout(() => {
      const input = document.querySelector('.popup-search-box input') as HTMLInputElement;
      input?.focus();
    }, 0);
  }




  clearColumnFilter(): void {
    if (this.activeFilterColumn) {
      this.columnFilters[this.activeFilterColumn] = new Set<string>(); // clear checkboxes
    }
  }



  getUniqueColumnValues(field: string): string[] {
    if (!field) return [];
    const source = this.filteredData(); // ← Use only the displayed table
    const values = source.map((item) => item[field] ?? '');
    return [...new Set(values)];
  }



  getFilteredPopupOptions(): string[] {
    const allOptions = this.getUniqueColumnValues(this.activeFilterColumn!);
    return allOptions.filter((opt) =>
      opt?.toLowerCase().includes(this.filterSearch.toLowerCase())
    );
  }

  // applyColumnFilter(): void {
  //   this.closeFilterPopup(); // hide popup

  //   const activeFilters = Object.entries(this.columnFilters)
  //     .filter(([_, set]) => set.size > 0);

  //   // Use the currently displayed (filtered) data as the filtering base
  //   let result = this.filteredData();

  //   for (const [field, values] of activeFilters) {
  //     result = result.filter(item => values.has(item[field]));
  //   }

  //   this.filteredData.set(result);
  // }

  applyColumnFilter(): void {
    this.closeFilterPopup();

    const activeFilters = Object.entries(this.columnFilters)
      .filter(([_, set]) => set.size > 0);

    if (activeFilters.length === 0) {
      // No filters → restore original unfiltered state
      this.filteredData.set([...this.originalFilteredData]);
      this.isFilterBaseInitialized = false; // Reset for future
      return;
    }

    // Start from original backup (not filteredData)
    let result = [...this.originalFilteredData];

    for (const [field, values] of activeFilters) {
      result = result.filter(item => values.has(item[field]));
    }

    this.filteredData.set(result);
  }


  closeFilterPopup(): void {
    this.filterPopupVisible = false;
    this.filterAnchor = null;
    this.activeFilterColumn = null;
  }


  toggleFilterSelection(value: string): void {
    if (!this.activeFilterColumn) return;
    const set = this.columnFilters[this.activeFilterColumn];
    set.has(value) ? set.delete(value) : set.add(value);
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
}
