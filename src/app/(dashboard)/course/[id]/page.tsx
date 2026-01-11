import ActivityIcon from '@/components/course/ActivityIcon';
import { ChevronDown, Edit3, Plus, Settings } from 'lucide-react';
import { getCookie } from 'cookies-next';
import { cookies } from 'next/headers';
import { getCourseDetailAction } from '@/lib/actions/course';
import { AddSectionButton, AddActivityButton } from '@/components/course/CourseEditor';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function CourseDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { edit } = await searchParams;
  const course = await getCourseDetailAction(id);

  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user_session');
  const user = userCookie ? JSON.parse(userCookie.value) : {};

  const isEditing = edit === '1';
  const canEdit = user.role === 'ADMIN' || user.role === 'TEACHER';

  if (!course) return <div className="p-12 text-center font-bold text-gray-400 tracking-widest uppercase">Mata Kuliah Tidak Ditemukan</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Course Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{course.code}</span>
              <span className="text-gray-300">•</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.category}</span>
            </div>
            <h1 className="text-3xl font-black text-brand-900 uppercase tracking-tight leading-tight">{course.title}</h1>
            <p className="text-brand-600 font-bold text-sm mt-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-white text-[10px] uppercase font-black">
                {course.instructor?.name?.charAt(0)}
              </span>
              {course.instructor?.name}
            </p>
          </div>
          {canEdit && (
            <Link
              href={isEditing ? `/course/${id}` : `/course/${id}?edit=1`}
              className={`flex items-center gap-2 px-6 py-3 border rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                isEditing
                  ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white'
                  : 'bg-brand-50 text-brand-primary border-brand-100 hover:bg-brand-primary hover:text-white'
              }`}
            >
              {isEditing ? 'Matikan Mode Edit' : 'Hidupkan Mode Edit'}
              <Edit3 size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Course Sections */}
      <div className="space-y-6">
        {/* Section Umum */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
            <h2 className="font-black text-brand-900 uppercase tracking-tight">Umum</h2>
            {isEditing && (
              <button className="p-2 hover:bg-brand-50 text-brand-primary rounded-xl transition-colors">
                <Plus size={20} />
              </button>
            )}
          </div>
          <div className="activity-item group">
            <ActivityIcon type="FORUM" className="mr-4" />
            <span className="text-sm font-bold text-brand-700 hover:underline cursor-pointer transition-all">Pengumuman & Berita Kuliah</span>
          </div>
        </div>

        {/* Dynamic Sections from DB */}
        {course.sections.map((section) => (
          <div key={section.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="bg-gray-50/50 p-8 border-b border-gray-50 flex items-center justify-between group">
              <div>
                <h2 className="font-black text-brand-900 uppercase tracking-tight leading-none mb-2">{section.title}</h2>
                {section.description && <p className="text-xs text-gray-400 font-medium">{section.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                {isEditing && (
                  <button className="p-2 text-red-400 hover:text-red-600 transition-colors">
                    <Settings size={18} />
                  </button>
                )}
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm border border-gray-100 group-hover:text-brand-primary transition-colors">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            <div className="p-4">
              {section.activities.length > 0 ? (
                section.activities.map((activity) => (
                  <div key={activity.id} className="flex items-center p-4 hover:bg-brand-50/30 rounded-2xl cursor-pointer transition-all group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-50 mr-4 group-hover:scale-110 transition-transform">
                      <ActivityIcon type={activity.type as any} />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/course/${course.id}/activity/${activity.id}`}
                        className="text-sm font-bold text-brand-900 group-hover:text-brand-primary transition-colors hover:underline decoration-2"
                      >
                        {activity.title}
                      </Link>
                      {activity.dueDate && (
                        <p className="text-[10px] font-black text-red-500 mt-1 uppercase tracking-widest">
                          Batas Waktu: {new Date(activity.dueDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                        </p>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><Edit3 size={16} /></button>
                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Settings size={16} /></button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Belum ada aktivitas di topik ini.</div>
              )}

              {isEditing && (
                <AddActivityButton courseId={course.id} sectionId={section.id} />
              )}
            </div>
          </div>
        ))}

        {isEditing && (
          <AddSectionButton courseId={course.id} />
        )}
      </div>
    </div>
  );
}
