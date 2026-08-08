import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    // Front-end disajikan sebagai berkas statis dan berkomunikasi dengan
    // back-end Go melalui REST API, sesuai arsitektur pada Bab III.
    adapter: adapter({ fallback: 'index.html' })
  }
};
