module.exports = {
  apps: [
    {
      name: 'prod.ngx-focus-point.believablecreations.app',
      script: './dist/ngx-focus-point/server/main.js',
      args: '--update-env',
      instances: '3',
      exec_mode: 'cluster',
    },
  ],
};
