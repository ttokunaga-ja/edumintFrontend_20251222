import React from 'react';
import { ProblemTypeEditProps } from '@/types/problemTypes';
import FreeTextEdit from './FreeTextEdit';

export default function TrueFalseEdit(props: ProblemTypeEditProps) {
  return <FreeTextEdit {...props} />;
}
