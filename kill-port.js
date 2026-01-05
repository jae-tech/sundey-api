#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * 주어진 포트를 사용하는 프로세스를 종료합니다.
 * @param {number} port - 종료할 포트 번호
 * @returns {boolean} 성공 여부
 */
function killProcessUsingPort(port) {
  try {
    // 포트를 사용하는 프로세스 찾기
    const cmd = `netstat -ano | findstr :${port}`;
    let output = '';

    try {
      output = execSync(cmd, { encoding: 'utf-8' });
    } catch (e) {
      // netstat 명령이 실패한 경우 (프로세스를 찾지 못한 경우)
      console.log(`✓ 포트 ${port}를 사용하는 프로세스를 찾지 못했습니다.`);
      return true;
    }

    if (!output.trim()) {
      console.log(`✓ 포트 ${port}를 사용하는 프로세스를 찾지 못했습니다.`);
      return true;
    }

    const pids = new Set();
    const lines = output.trim().split('\n');

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];

      if (/^\d+$/.test(pid)) {
        pids.add(pid);
      }
    }

    let success = true;

    for (const pid of pids) {
      // System 프로세스(PID 4)는 종료하지 않음
      if (pid === '4') {
        console.log(`⚠️  PID ${pid}는 시스템 프로세스이므로 스킵합니다.`);
        continue;
      }

      try {
        console.log(`🔴 PID ${pid} 종료 중 (포트 ${port})`);
        execSync(`taskkill /PID ${pid} /F`, {
          stdio: 'pipe',
        });
        console.log(`✓ PID ${pid} 종료 완료`);
      } catch (error) {
        console.log(`✗ PID ${pid} 종료 실패`);
        success = false;
      }
    }

    // 포트가 해제될 시간 제공
    if (success && pids.size > 0) {
      console.log(`⏳ 포트 해제 대기 중...`);
      // 1초 대기
      const now = Date.now();
      while (Date.now() - now < 1000) {
        // 대기
      }
    }

    return success;
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
    return false;
  }
}

/**
 * .env 파일에서 PORT 값을 읽습니다.
 * @returns {number} 포트 번호
 */
function getPortFromEnv() {
  try {
    const envPath = resolve('.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/^PORT=(\d+)/m);
    if (match) {
      return parseInt(match[1], 10);
    }
  } catch (error) {
    // .env 파일이 없거나 읽을 수 없음
  }
  return 3000; // 기본값
}

// 메인 실행
const args = process.argv.slice(2);
let port = getPortFromEnv();

if (args.length > 0) {
  const parsedPort = parseInt(args[0], 10);
  if (isNaN(parsedPort)) {
    console.error('❌ 포트 번호는 숫자여야 합니다.');
    process.exit(1);
  }
  port = parsedPort;
}

console.log(`포트 ${port} 정리 중...`);
if (killProcessUsingPort(port)) {
  console.log(`✅ 포트 ${port} 정리 완료`);
  process.exit(0);
} else {
  console.log(`⚠️  포트 ${port} 정리 중 일부 오류 발생`);
  process.exit(0); // dev 명령이 계속되도록 exit(0)
}
