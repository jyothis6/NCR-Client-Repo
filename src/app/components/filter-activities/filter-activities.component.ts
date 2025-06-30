import { Component, ElementRef, EventEmitter, Output, signal, ViewChild, HostListener, Input, SimpleChanges } from '@angular/core';

import {
  DropDownListModule,
  DropDownListComponent,
} from '@progress/kendo-angular-dropdowns';
import { MultiSelectModule } from '@progress/kendo-angular-dropdowns';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ChipModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { PopupModule } from '@progress/kendo-angular-popup';
import { MenuModule } from '@progress/kendo-angular-menu';
import { MenuItem } from '@progress/kendo-angular-menu';



@Component({
  selector: 'app-filter-activities',
  standalone: true,
  imports: [
    CommonModule,
    DropDownListModule,
    MultiSelectModule,
    ButtonsModule,
    FormsModule,
    ChipModule,
    PopupModule,
    MenuModule,
    DialogModule
  ],
  templateUrl: './filter-activities.component.html',
  styleUrls: ['./filter-activities.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FilterActivitiesComponent {

  expanded = signal(true);
  menuOpen = signal(false);
  savedFilters = ['Saved Filter 1', 'Saved Filter 2', 'Saved Filter 3', 'Saved Filter 4'];

  @Output() viewModeChanged = new EventEmitter<string>();
  @ViewChild('menuButton', { static: false }) menuButton!: ElementRef;
  @ViewChild('popupRef', { static: false }) popupRef!: ElementRef;
  @Output() typeChanged = new EventEmitter<string>();
  @Input() initiallyCollapsed = false;


  popupLeaveTimeout: any;

  viewAsOptions = ['Tabular', 'Chart'];
  selectedViewAs = 'Tabular';

  functionOptions = ['Individual', 'Project', 'Office'];
  selectedFunction = 'Individual';

  showInstructionDialog = false;
  showSaveDialog = false;
newFilterName = '';
addAsFavorite = false;

  ngOnInit() {
    this.expanded.set(!this.initiallyCollapsed);
  this.viewModeChanged.emit(this.selectedViewAs);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initiallyCollapsed'] && !changes['initiallyCollapsed'].firstChange) {
      const shouldCollapse = changes['initiallyCollapsed'].currentValue;
      this.expanded.set(!shouldCollapse);
    }
  }

  toggleExpand() {
    this.expanded.update((v) => !v);
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }


  clearFilters() {
    this.selectedViewAs = 'Tabular';
    this.selectedFunction = 'Individual';
    this.viewModeChanged.emit(this.selectedViewAs);
    this.typeChanged.emit(this.selectedFunction);
  }

  onFunctionChange() {
    this.typeChanged.emit(this.selectedFunction);
  }
  onViewAsChange() {
    this.viewModeChanged.emit(this.selectedViewAs);
  }


  onMenuSelect({ item }: { item: MenuItem }) {
    if (item.text === 'Save Filter') {
      this.newFilterName = '';
      this.addAsFavorite = false;
      this.showSaveDialog = true;
    } else if (item.text === 'Instruction to use') {
      this.showInstructionDialog = true;
    } else if (this.savedFilters.includes(item.text || '')) {
      console.log('Loading filter:', item.text);
    }

    this.menuOpen.set(false);
  }



  menuItems: MenuItem[] = [
    {
      text: 'Save Filter',
      icon: 'save',
      cssClass: 'save-filter-menu', // <-- Add this
    },
    {
      text: 'Load Filter',
      icon: 'filter',
      cssClass: 'load-filter-menu',
      items: this.savedFilters.map((filter) => ({
        text: filter,
        cssClass: 'load-filter-menu', // Add to children too
      })),
    },
    {
      text: 'Instruction to use',
      icon: 'help',
      cssClass: 'instruction-menu',
    },
  ];

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (
      this.menuOpen() &&
      !this.menuButton?.nativeElement.contains(target) &&
      !target.closest('.k-popup')
    ) {
      this.menuOpen.set(false);
    }
  }
  onPopupMouseLeave() {
    this.popupLeaveTimeout = setTimeout(() => {
      this.menuOpen.set(false);
    }, 3000);
  }

  saveFilter(): void {
    if (!this.newFilterName.trim()) return;

    // Prevent duplicates
    if (!this.savedFilters.includes(this.newFilterName.trim())) {
      this.savedFilters.push(this.newFilterName.trim());
    }

    // Update the Load Filter menu dynamically
    this.menuItems = this.menuItems.map(item => {
      if (item.text === 'Load Filter') {
        return {
          ...item,
          items: this.savedFilters.map(name => ({ text: name }))
        };
      }
      return item;
    });

    this.showSaveDialog = false;
  }


}
