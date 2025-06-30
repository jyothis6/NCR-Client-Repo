import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  ViewContainerRef,
  TemplateRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';
import { PopupService, PopupRef } from '@progress/kendo-angular-popup';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @ViewChild('popupAnchor', { read: ViewContainerRef }) anchor!: ViewContainerRef;
  @ViewChild('popupTemplate') popupTemplate!: TemplateRef<any>;

  userName: string = '';
  userEmail: string = '';
  role: string = '';
  popupRef: PopupRef | null = null;
  private userSub!: Subscription;

  // Hover flags
  isHoveringPopup: boolean = false;
  isHoveringTrigger: boolean = false;

  constructor(
    private router: Router,
    private eRef: ElementRef,
    private auth: AuthService,
    private popupService: PopupService
  ) {}

  ngOnInit() {
    this.userSub = this.auth.user$.subscribe(user => {
      this.userName = user?.username || '';
      this.role = user?.role || '';
      this.userEmail = user?.email || '';
    });
  }

  toggleMiniSidebar() {
    this.toggleSidebar.emit();
  }

  toggleDropdown() {
    if (this.popupRef) {
      this.popupRef.close();
      this.popupRef = null;
    } else {
      this.popupRef = this.popupService.open({
        anchor: this.anchor.element.nativeElement,
        content: this.popupTemplate,
        positionMode: 'absolute',
        popupAlign: { horizontal: 'right', vertical: 'bottom' },
        anchorAlign: { horizontal: 'right', vertical: 'top' },
      });
    }
  }

  // Popup dismissal on hover-out
  onMouseLeaveTrigger() {
    this.isHoveringTrigger = false;
    this.schedulePopupClose();
  }

  onMouseLeavePopup() {
    this.isHoveringPopup = false;
    this.schedulePopupClose();
  }

  schedulePopupClose() {
    setTimeout(() => {
      if (!this.isHoveringPopup && !this.isHoveringTrigger) {
        this.popupRef?.close();
        this.popupRef = null;
      }
    }, 150); // Delay for re-entry wiggle room
  }

  navigateToDashboard() {
    this.popupRef?.close();
    this.router.navigate(['/dashboard-selection']);
  }

  logout() {
    this.popupRef?.close();
    this.auth.logout();
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
