/**
 * FILE GUIDE: Sample doctor data used by the demo interface.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

// Starting doctors. After the first load they live in the saved app state, and the admin can add more.
export const DOCTORS = [
  { id: 'd1', name: 'Dr. Abdulrazaq Salawu', title: 'OB/GYN', clinic: 'University of Ilorin Teaching Hospital', area: 'Ilorin, Kwara', km: 1.8, fee: 10000, rating: 4.9, reviews: 112, code: 'SALAWU24', days: [1, 3, 5], start: 9, end: 13, dur: 30, bio: 'Fifteen years of antenatal care. Sees mothers from the first booking visit through delivery planning.' },
  { id: 'd2', name: 'Hajia Maryam Abubakar', title: 'Midwife', clinic: 'Sobi Specialist Hospital', area: 'Ilorin, Kwara', km: 3.4, fee: 5000, rating: 4.8, reviews: 74, code: 'MARYAM7', days: [1, 2, 4], start: 10, end: 16, dur: 30, bio: 'Midwife-led care with a focus on first-time mothers and calm birth preparation.' },
  { id: 'd3', name: 'Dr. Folasade Ibitoye', title: 'OB/GYN', clinic: 'General Hospital Ilorin', area: 'Ilorin, Kwara', km: 2.6, fee: 12000, rating: 4.7, reviews: 91, code: 'FOLASADE12', days: [2, 4, 6], start: 8, end: 12, dur: 30, bio: 'Handles routine and higher-risk pregnancies. Weekend clinic on Saturdays.' },
  { id: 'd4', name: 'Ibrahim Yahaya', title: 'Sonographer', clinic: 'Ajikobi Cottage Hospital', area: 'Ilorin, Kwara', km: 4.9, fee: 7000, rating: 4.6, reviews: 58, code: 'IBRAHIM5', days: [1, 2, 3, 4, 5], start: 12, end: 17, dur: 20, bio: 'Dating, anomaly and growth scans with same-day reports.' },
  { id: 'd5', name: 'Dr. Aminat Oyewole', title: 'OB/GYN', clinic: 'Crescent Gold Crown Hospital', area: 'Ilorin, Kwara', km: 3.9, fee: 9000, rating: 4.7, reviews: 63, code: 'AMINAT9', days: [2, 3, 5], start: 9, end: 14, dur: 30, bio: 'Routine antenatal care and delivery planning for mothers across Ilorin.' }
];

export default DOCTORS;
