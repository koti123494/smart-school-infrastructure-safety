import { LocationType, ProblemCategory } from '../types';

export const LOCATION_PROBLEMS: Partial<Record<LocationType, ProblemCategory[]>> = {
  Classroom: ['Broken Fan', 'Broken Light', 'Damaged Desk/Bench', 'Broken Door', 'Broken Window', 'Projector Problem', 'Electrical Problem', 'Cleanliness Problem', 'Other'],
  Laboratory: ['Lab Equipment Problem', 'Electrical Problem', 'Broken Light', 'Broken Fan', 'Damaged Desk', 'Water Leakage', 'Safety Equipment Problem', 'Other'],
  Library: ['Broken Light', 'Broken Fan', 'Damaged Chair/Table', 'Computer/System Problem', 'Electrical Problem', 'Cleanliness Problem', 'Other'],
  Washroom: ['Water Leakage', 'Tap Problem', 'Flush Problem', 'Door Problem', 'Lighting Problem', 'Cleanliness Problem', 'Plumbing Problem', 'Other'],
  Playground: ['Damaged Equipment', 'Broken Lights', 'Ground/Safety Problem', 'Water Problem', 'Cleanliness Problem', 'Other'],
  Corridor: ['Broken Light', 'Water Leakage', 'Damaged Wall', 'Floor Problem', 'Electrical Problem', 'Cleanliness Problem', 'Other'],
  Canteen: ['Food Quality Problem', 'Hygiene Problem', 'Water Problem', 'Electrical Problem', 'Equipment Problem', 'Cleanliness Problem', 'Other'],
  'Parking Area': ['Lighting Problem', 'Drainage/Water Problem', 'Security Problem', 'Damaged Surface', 'Cleanliness Problem', 'Other'],
  'Electrical Room': ['Electrical Fault', 'Wiring Problem', 'Switch/Panel Problem', 'Power Issue', 'Safety Hazard', 'Other'],
  "Teachers' Class / Faculty Room": ['Broken Fan', 'Broken Light', 'Furniture Problem', 'Electrical Problem', 'AC Problem', 'Cleanliness Problem', 'Other'],
  'Main Building': ['Other'],
};

export const WEEKLY_MENU = {
  Monday: 'Rice, Dal, Sambar, Curd, Pickle',
  Tuesday: 'Chapati, Veg Curry, Rice, Sambar',
  Wednesday: 'Pulihora, Curd Rice, Potato Fry',
  Thursday: 'Veg Biryani, Raita, Sweet - Kheer',
  Friday: 'Rice, Rasam, Veg Fry, Papad',
  Saturday: 'Lemon Rice, Curd, Chips, Pickle',
} as const;

export const LUNCH_TIME = '1:00 PM';