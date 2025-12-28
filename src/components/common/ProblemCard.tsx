import React from 'react';
import { Eye, ThumbsUp, MessageSquare } from 'lucide-react';
import { Card } from '@/components/primitives/card';
import { Badge } from '@/components/primitives/badge';
import { cn } from '@/shared/utils';
import type { Exam } from '@/types';

interface ProblemCardProps {
    problem: Exam;
    onClick?: (problemId: string) => void;
    className?: string;
}

export function ProblemCard({ problem, onClick, className }: ProblemCardProps) {
    return (
        <Card
            
            onClick={() => onClick?.(problem.id)}
        >
            <div>
                {/* Title */}
                <h3 >
                    {problem.title || problem.examName}
                </h3>

                {/* Tags */}
                <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
                    {problem.subjectName && (
                        <Badge variant="outline" >
                            {problem.subjectName}
                        </Badge>
                    )}
                    {problem.universityName && (
                        <Badge variant="secondary" >
                            {problem.universityName}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div style={{
      display: "flex",
      alignItems: "center"
    }>
                <span style={{
      display: "flex",
      alignItems: "center",
      gap: "0.25rem"
    }>
                    <Eye  />
                    {(problem.viewCount || 0).toLocaleString()}
                </span>
                <span style={{
      display: "flex",
      alignItems: "center",
      gap: "0.25rem"
    }>
                    <ThumbsUp  />
                    {(problem.goodCount || 0).toLocaleString()}
                </span>
                <span style={{
      display: "flex",
      alignItems: "center",
      gap: "0.25rem"
    }>
                    <MessageSquare  />
                    {(problem.commentCount || 0).toLocaleString()}
                </span>
            </div>
        </Card>
    );
}
