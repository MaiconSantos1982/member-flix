import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types para o banco de dados
export type UserRole = 'admin' | 'student';
export type LessonType = 'video' | 'pdf';

export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role: UserRole;
    cpf?: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    title: string;
    description?: string;
    cover_image?: string;
    price: number;
    is_published: boolean;
    sales_video_url?: string;
    benefits?: string[]; // Lista de benefícios editáveis
    created_at: string;
    updated_at: string;
}

export interface Module {
    id: string;
    product_id: string;
    title: string;
    description?: string;
    order_index: number;
    days_to_unlock: number;
    created_at: string;
}

export interface Lesson {
    id: string;
    module_id: string;
    title: string;
    description?: string;
    type: LessonType;
    video_url?: string;
    pdf_path?: string;
    thumbnail_url?: string;
    duration_seconds?: number;
    order_index: number;
    banner_img_url?: string;
    banner_link?: string;
    created_at: string;
}

export interface Enrollment {
    id: string;
    user_id: string;
    product_id: string;
    active: boolean;
    enrolled_at: string;
    expires_at?: string;
}

export interface LessonProgress {
    id: string;
    user_id: string;
    lesson_id: string;
    completed: boolean;
    progress_percent: number;
    last_watched_at: string;
}

// Tipos compostos para queries com joins
export interface ProductWithAccess extends Product {
    has_access: boolean;
    modules?: ModuleWithLessons[];
}

export interface ModuleWithLessons extends Module {
    lessons: Lesson[];
    is_unlocked: boolean;
}

export interface LessonWithProgress extends Lesson {
    progress?: LessonProgress;
}
