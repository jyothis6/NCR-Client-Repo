import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationHeaderComponent } from './operation-header.component';

describe('OperationHeaderComponent', () => {
  let component: OperationHeaderComponent;
  let fixture: ComponentFixture<OperationHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OperationHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
