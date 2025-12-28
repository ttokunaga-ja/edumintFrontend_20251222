import { useState } from 'react';
import { updateExam as updateExamApi } from '@/services/api/gateway/content'; export function useExamEditor() { const [isSaving, setIsSaving] = useState(false); async function updateExam(id: string, updates: any) { setIsSaving(true); try { return await updateExamApi(id, updates); } finally { setIsSaving(false); } } return { updateExam, isSaving };
}
