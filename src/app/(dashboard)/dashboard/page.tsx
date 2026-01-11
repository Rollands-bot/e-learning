import CourseCard from '@/components/dashboard/CourseCard';
import { getCoursesAction, getRecentActivitiesAction } from '@/lib/actions/course';
import { getUsersAction } from '@/lib/actions/user';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Users, GraduationCap, BookOpen, FileCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user_session');
  const user = userCookie ? JSON.parse(userCookie.value) : {};
  const isAdmin = user.role === 'ADMIN';

  const dbCourses = await getCoursesAction();
  const recentActivities = await getRecentActivitiesAction();
  const allUsers = await getUsersAction();

  const courses = dbCourses.map(c => ({
    ...c,
    instructor: (c.instructor as any)?.name || 'Dosen Pengampu',
    sections: c.sections || []
  }));

  if (isAdmin) {
    return (
      <div className="space-y-10 font-jakarta">
        <div>
          <h1 className="text-3xl font-black text-brand-900 uppercase tracking-tight leading-none mb-2">Sistem Administrasi</h1>
          <p className="text-gray-500 font-medium">Ringkasan operasional sistem LMS UNIPEM hari ini.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Mahasiswa', value: allUsers.filter(u => u.role === 'STUDENT').length, icon: GraduationCap, color: 'bg-green-50 text-green-600' },
            { label: 'Total Dosen', value: allUsers.filter(u => u.role === 'TEACHER').length, icon: Users, color: 'bg-brand-50 text-brand-700' },
            { label: 'Mata Kuliah', value: dbCourses.length, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
            { label: 'Pengajuan Tugas', value: recentActivities.length, icon: FileCheck, color: 'bg-amber-50 text-amber-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-2xl font-black text-brand-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h2 className="font-black text-brand-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-brand-primary rounded-full"></div>
              Aktivitas Pengguna
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-2">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 font-black text-xs uppercase">
                    {activity.student?.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">
                      <span className="text-brand-700">{activity.student?.name}</span> mengumpulkan tugas di MK 
                      <span className="text-brand-900 italic"> "{activity.activity?.section?.course?.title}"</span>
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{new Date(activity.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-900/30">
            <h2 className="font-black uppercase tracking-widest text-brand-300 text-sm mb-8">Aksi Cepat Admin</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/users" className="p-6 bg-white/10 rounded-3xl hover:bg-white/20 transition-all border border-white/5 flex flex-col gap-3 group text-left">
                <Users className="text-brand-300 group-hover:scale-110 transition-transform" />
                <p className="font-black uppercase tracking-tighter text-xs">Tambah Pengguna</p>
              </Link>
              <Link href="/admin/courses" className="p-6 bg-white/10 rounded-3xl hover:bg-white/20 transition-all border border-white/5 flex flex-col gap-3 group text-left">
                <BookOpen className="text-brand-300 group-hover:scale-110 transition-transform" />
                <p className="font-black uppercase tracking-tighter text-xs">Buat Mata Kuliah</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 font-jakarta">
      <div>
        <h1 className="text-3xl font-black text-brand-900 uppercase tracking-tight">Dashboard Saya</h1>
        <p className="text-gray-500 font-medium">Selamat datang kembali di Learning Management System UNIPEM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard key={course.id} course={course as any} />
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada kursus yang terdaftar</p>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h2 className="font-black text-brand-900 uppercase tracking-tight mb-6 flex items-center gap-2">
          <div className="w-2 h-6 bg-brand-primary rounded-full"></div>
          Aktivitas Terkini
        </h2>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.filter(a => user.role === 'ADMIN' || a.studentId === user.id || a.activity?.section?.course?.instructorId === user.id).map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 text-sm text-gray-600 pb-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 p-2 rounded-xl transition-colors">
                <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-700 font-black text-xs">
                  {activity.student?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    <span className="font-black text-brand-700">{activity.student?.name}</span> mengumpulkan tugas 
                    <strong className="text-brand-900 ml-1 italic">"{activity.activity?.title}"</strong>
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                    {activity.activity?.section?.course?.title}
                  </p>
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  {new Date(activity.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Belum ada aktivitas pengiriman tugas baru.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}