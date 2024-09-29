import preprocess from 'svelte-preprocess';

plugins: [
  svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file - better for performance
      css: css => {
          css.write('public/build/bundle.css');
      },
      preprocess: preprocess(),
  }),
]
// 