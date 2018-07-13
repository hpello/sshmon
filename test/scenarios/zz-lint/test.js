const { spawn } = require('child_process')

spawn('npm', ['run', 'lint'], {
  cwd: '/opt/sshmon',
  stdio: 'inherit'
})
