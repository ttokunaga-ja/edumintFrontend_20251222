import { describe, it, expect } from 'vitest';
import { transformToForm, transformToApi } from './normalization';

describe('normalization', () => {
  it('maps api university_id to form universityId', () => {
    const api = { id: 1, exam_name: 'X', university_id: 42 };
    const form = transformToForm(api as any);
    expect(form.universityId).toBe(42);
  });

  it('maps form universityId to api university_id', () => {
    const form = {
      id: 'temp',
      examName: 'X',
      examYear: 2025,
      universityName: 'U',
      universityId: 99,
      facultyName: '',
      teacherName: '',
      subjectName: '',
      durationMinutes: 60,
      majorType: 0,
      academicFieldName: '',
      questions: [],
    } as any;

    const api = transformToApi(form);
    expect(api.university_id).toBe(99);
  });
});
