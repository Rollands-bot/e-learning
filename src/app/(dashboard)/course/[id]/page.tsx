import Link from 'next/link';
import ActivityIcon from '@/components/course/ActivityIcon';
import { ChevronDown, Edit3, Settings, Plus } from 'lucide-react';
import { cookies } from 'next/headers';
import { getCourseDetailAction } from '@/lib/actions/course';
import { AddSectionButton, AddActivityButton } from '@/components/course/CourseEditor';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export const runtime = 'edge';

export default async function CourseDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { edit } = await searchParams;
  const course = await getCourseDetailAction(id);
  
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user_session');
  const user = userCookie ? JSON.parse(userCookie.value) : {};
  
  const isEditing = edit === '1';
  const canEdit = user.role === 'ADMIN' || user.role === 'TEACHER';

  if (!course) return <div className="p-12 text-center font-black text-gray-300 uppercase tracking-[0.3em]">Mata Kuliah Tidak Ditemukan</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 font-jakarta">
      <div className="bg-white border border-gray-100 rounded-3xl p-8 mb-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-brand-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{course.code}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.category}</span>
            </div>
            <h1 className="text-4xl font-black text-brand-900 uppercase tracking-tight leading-tight mb-4">{course.title}</h1>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                {course.instructor?.name?.charAt(0)}
              </div>
              <p className="text-brand-900 font-bold text-sm uppercase tracking-tighter">{course.instructor?.name}</p>
            </div>
          </div>
          {canEdit && (
            <Link 
              href={isEditing ? `/course/${id}` : `/course/${id}?edit=1`}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
                isEditing 
                  ? 'bg-red-500 text-white shadow-red-900/20' 
                  : 'bg-brand-primary text-white shadow-brand-900/20'
              }`}
            >
              {isEditing ? 'Matikan Mode Edit' : 'Hidupkan Mode Edit'}
              <Edit3 size={16} />
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
            <h2 className="font-black text-brand-900 uppercase tracking-tight text-lg">Umum</h2>
          </div>
          <div className="flex items-center p-4 hover:bg-brand-50/30 rounded-2xl cursor-pointer transition-all">
            <ActivityIcon type="FORUM" className="mr-4" />
            <span className="text-sm font-bold text-brand-900 uppercase tracking-tight hover:underline">Pengumuman Perkuliahan</span>
          </div>
        </div>

        {course.sections.map((section: import('@/types').Section) => (
          <div key={section.id} className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-sm">
            <div className="bg-gray-50/50 p-8 border-b border-gray-50 flex items-center justify-between group">
              <div>
                <h2 className="font-black text-brand-900 uppercase tracking-tight text-xl mb-1">{section.title}</h2>
                {section.description && <p className="text-xs text-gray-400 font-medium">{section.description}</p>}
              </div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm border border-gray-100 group-hover:text-brand-primary transition-all">
                <ChevronDown size={24} />
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-2">
                {section.activities.length > 0 ? (
                  section.activities.map((activity) => (
                    <div key={activity.id} className="flex items-center p-5 hover:bg-brand-50/50 rounded-3xl cursor-pointer transition-all group">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-50 mr-5 group-hover:scale-110 transition-transform">
                        <ActivityIcon type={activity.type as any} />
                      </div>
                      <div className="flex-1">
                        <Link 
                          href={`/course/${course.id}/activity/${activity.id}`}
                          className="text-sm font-black text-brand-900 uppercase tracking-tight group-hover:text-brand-primary transition-colors hover:underline"
                        >
                          {activity.title}
                        </Link>
                        {activity.dueDate && (
                          <p className="text-[10px] font-black text-red-500 mt-1 uppercase tracking-widest">
                            Deadline: {new Date(activity.dueDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                          </p>
                        )}
                      </div>
                      {isEditing && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-3 text-gray-400 hover:text-brand-primary hover:bg-white rounded-xl shadow-sm transition-all"><Edit3 size={16} /></button>
                          <button className="p-3 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl shadow-sm transition-all"><Settings size={16} /></button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Belum ada aktivitas di topik ini.</div>
                )}
              </div>

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