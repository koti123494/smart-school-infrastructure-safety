import { Classroom } from '../types';

export const getClassroomQrCode = (classroom: Classroom): string => {
  const roomDigits = classroom.roomNumber.match(/\d+/)?.[0];
  if (!roomDigits) return classroom.id.toUpperCase();

  const buildingPrefix =
    classroom.buildingName.match(/(?:block|wing)\s*([A-Z])/i)?.[1]?.toUpperCase() ||
    classroom.buildingName.match(/\b([A-Z])\b/)?.[1]?.toUpperCase() ||
    'S';
  return `${buildingPrefix}${roomDigits}`;
};

export const normalizeClassroomQrCode = (value: string): string =>
  decodeURIComponent(value).trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

export const findClassroomByQrCode = (
  classrooms: Classroom[],
  value?: string | null
): Classroom | undefined => {
  if (!value) return undefined;
  const normalized = normalizeClassroomQrCode(value);
  return classrooms.find((classroom) => getClassroomQrCode(classroom) === normalized);
};

export const getClassroomReportUrl = (classroom: Classroom): string => {
  const code = getClassroomQrCode(classroom);
  return `${window.location.origin}/report-problem?classroom=${encodeURIComponent(code)}`;
};
