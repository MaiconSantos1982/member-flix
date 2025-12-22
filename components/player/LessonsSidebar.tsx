'use client';

import React from 'react';
import Image from 'next/image';
import { Play, CheckCircle, Lock, Clock, FileText, Video } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { Lesson, Module, LessonProgress } from '@/lib/supabase';

interface LessonsSidebarProps {
    modules: (Module & {
        lessons: (Lesson & { progress?: LessonProgress })[];
        is_unlocked: boolean;
        unlock_date?: Date;
    })[];
    currentLessonId?: string;
    onLessonClick: (lesson: Lesson) => void;
    className?: string;
}

export function LessonsSidebar({
    modules,
    currentLessonId,
    onLessonClick,
    className
}: LessonsSidebarProps) {
    return (
        <div className={cn('bg-netflix-dark rounded-lg overflow-hidden', className)}>
            <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Conteúdo do Curso</h3>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
                {modules.map((module, moduleIndex) => (
                    <div key={module.id} className="border-b border-white/5 last:border-b-0">
                        {/* Module Header */}
                        <div className={cn(
                            'flex items-center gap-3 p-4',
                            !module.is_unlocked && 'opacity-60'
                        )}>
                            <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold',
                                module.is_unlocked ? 'bg-netflix-red text-white' : 'bg-netflix-gray-lighter text-netflix-text-muted'
                            )}>
                                {module.is_unlocked ? moduleIndex + 1 : <Lock className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-white truncate">
                                    {module.title}
                                </h4>
                                {!module.is_unlocked && module.unlock_date && (
                                    <p className="text-xs text-netflix-text-muted flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3" />
                                        Libera em {module.unlock_date.toLocaleDateString('pt-BR')}
                                    </p>
                                )}
                                {module.is_unlocked && (
                                    <p className="text-xs text-netflix-text-muted mt-0.5">
                                        {module.lessons.length} aulas
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Lessons List */}
                        {module.is_unlocked && (
                            <div className="pb-2">
                                {module.lessons.map((lesson, lessonIndex) => {
                                    const isActive = currentLessonId === lesson.id;
                                    const isCompleted = lesson.progress?.completed;

                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => onLessonClick(lesson)}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                                                isActive
                                                    ? 'bg-netflix-red/20 border-l-2 border-netflix-red'
                                                    : 'hover:bg-white/5',
                                            )}
                                        >
                                            {/* Lesson Number/Status */}
                                            <div className={cn(
                                                'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs',
                                                isCompleted
                                                    ? 'bg-green-600 text-white'
                                                    : isActive
                                                        ? 'bg-netflix-red text-white'
                                                        : 'bg-netflix-gray-lighter text-netflix-text-muted'
                                            )}>
                                                {isCompleted ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    lessonIndex + 1
                                                )}
                                            </div>

                                            {/* Lesson Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    'text-sm truncate',
                                                    isActive ? 'text-white font-medium' : 'text-netflix-text'
                                                )}>
                                                    {lesson.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {lesson.type === 'video' ? (
                                                        <Video className="w-3 h-3 text-netflix-text-muted" />
                                                    ) : (
                                                        <FileText className="w-3 h-3 text-netflix-text-muted" />
                                                    )}
                                                    {lesson.duration_seconds && (
                                                        <span className="text-xs text-netflix-text-muted">
                                                            {formatDuration(lesson.duration_seconds)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Play Icon */}
                                            {isActive && (
                                                <Play className="w-4 h-4 text-netflix-red flex-shrink-0" fill="currentColor" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
