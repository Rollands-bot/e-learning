import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/types';
import { Users, BookOpen } from 'lucide-react';

export default function CourseCard({ course }: { course: Course }) {
  return (
    <div className="moodle-card overflow-hidden group">
      <div className="relative h-32 w-full bg-gray-200">
        <Image 
          src={course.thumbnail} 
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-brand-800 shadow-sm">
          {course.code}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-brand-900 group-hover:text-brand-primary transition-colors line-clamp-1">
          <Link href={`/course/${course.id}`}>{course.title}</Link>
        </h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
          {typeof course.instructor === 'string' ? course.instructor : (course.instructor as any)?.name || 'Dosen Pengampu'}
        </p>
        
        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
          <div className="flex items-center gap-3 text-gray-300">
            <div className="flex items-center gap-1.5">
              <BookOpen size={12} className="text-brand-primary/40" />
              <span className="text-[10px] font-black uppercase tracking-tighter">{course.sections?.length || 0} Topic</span>
            </div>
          </div>
          <Link 
            href={`/course/${course.id}`}
            className="text-xs font-semibold text-brand-primary hover:underline"
          >
            Masuk Kelas
          </Link>
        </div>
      </div>
    </div>
  );
}
