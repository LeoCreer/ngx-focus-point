module.exports = {
  apps: [
    {
      name: 'staging.ngx-focus-point.believablecreations.app',
      script: './dist/ngx-focus-point/server/main.js',
      args: '--update-env',
      instances: '1',
      exec_mode: 'cluster',
    },
  ],
};
