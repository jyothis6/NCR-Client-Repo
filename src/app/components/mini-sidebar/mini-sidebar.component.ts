import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-mini-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './mini-sidebar.component.html',
  styleUrl: './mini-sidebar.component.scss'
})
export class MiniSidebarComponent {
  @Output() expandSidebar = new EventEmitter<void>();

  onMenuClick(menuName: string) {
    if (menuName === 'Modules') {
      this.expandSidebar.emit(); // 🔸 Emit event to parent
    } else {
      alert("Other page views are in progress...");
    }
  }
}
