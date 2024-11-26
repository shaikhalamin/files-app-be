module.exports = {
  apps: [
    {
      name: 'node_backend',
      script: 'dist/src/main.js',
      instances: 'max', // Or 'max' for clustering to utilize all cores
      exec_mode: 'cluster', // Optional: runs in cluster mode
      env: {
        NODE_ENV: 'production',
        PORT: 8056,
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/node_backend',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        JWT_TOKEN_SECRET: 'insertyourvaluehere',
      },
      output: './logs/out.log', // Standard output logs
      error: './logs/error.log', // Error logs
      merge_logs: true, // Optional: merge logs from different instances
      time: true, // Optional: adds timestamp to logs
    },
  ],
};
