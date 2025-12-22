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
            className={cn(
                "p-6 h-48 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between",
                className
            )}
            onClick={() => onClick?.(problem.id)}
        >
            <div>
                {/* Title */}
                <h3 className="text-gray-900 mb-2 line-clamp-2 font-medium leading-snug">
                    {problem.title || problem.examName}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {problem.subjectName && (
                        <Badge variant="outline" className="text-xs">
                            {problem.subjectName}
                        </Badge>
                    )}
                    {problem.universityName && (
                        <Badge variant="secondary" className="text-xs">
                            {problem.universityName}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-50">
                <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {(problem.viewCount || 0).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {(problem.goodCount || 0).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {(problem.commentCount || 0).toLocaleString()}
                </span>
            </div>
        </Card>
    );
}
