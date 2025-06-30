// src/app/models/activity.model.ts
export interface Activity {
  projectId: string;
  activityId: string;
  activityName: string;
  primaryResourceName: string;
  earlyDate: string;
  type: 'Individual' | 'Project' | 'Office';
}
