// Aplikasi berjalan sebagai Single Page Application: token disimpan di
// localStorage sehingga tidak ada data sesi yang tersedia di sisi server.
//
// prerender dimatikan karena route dinamis seperti /mata-kuliah/[id] memiliki
// id UUID yang tidak dapat dienumerasi saat build; seluruh route dilayani
// melalui fallback index.html milik adapter-static.
export const ssr = false;
export const prerender = false;
