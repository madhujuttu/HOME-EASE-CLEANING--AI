import http from 'http';
import { spawn } from 'child_process';

const run = async () => {
  console.log('--- Starting Backend Server Test ---');
  const serverProcess = spawn('node', ['dist/server.js'], { cwd: process.cwd(), stdio: 'pipe' });

  serverProcess.stdout.on('data', (d) => {
    console.log(`[SERVER STDOUT] ${d}`);
  });

  serverProcess.stderr.on('data', (d) => {
    console.log(`[SERVER STDERR] ${d}`);
  });

  // Wait 3.5s for server initialization
  await new Promise(r => setTimeout(r, 3500));

  const testEndpoint = (path, method = 'GET', body = null) => {
    return new Promise((resolve) => {
      const options = {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method,
        headers: { 'Content-Type': 'application/json' }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, body: JSON.parse(data || '{}') });
        });
      });

      req.on('error', (err) => {
        console.error(`Error requesting ${path}:`, err.message);
        resolve({ error: err.message });
      });
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Healthcheck
    const health = await testEndpoint('/health');
    console.log('1. Health check:', health.status, health.body?.status, health.body?.database);

    // 2. Auth Login
    const login = await testEndpoint('/api/v1/auth/login', 'POST', {
      email: 'alexander@homeeaseguru.com',
      password: 'password123'
    });
    console.log('2. Auth Login:', login.status, login.body?.success, 'User:', login.body?.user?.name, 'Role:', login.body?.user?.role);
    const token = login.body?.token;

    // 3. Leads
    const leads = await testEndpoint('/api/v1/leads');
    console.log('3. Leads Endpoint:', leads.status, 'Total Leads:', leads.body?.count, 'First Lead:', leads.body?.leads?.[0]?.name);

    // 4. Services
    const services = await testEndpoint('/api/v1/services');
    console.log('4. Services Endpoint:', services.status, 'Total Services:', services.body?.count, 'First Service:', services.body?.services?.[0]?.name);

    // 5. AI Copilot
    const copilot = await testEndpoint('/api/v1/ai/copilot', 'POST', {
      query: 'What meetings do I have scheduled today?'
    });
    console.log('5. AI Copilot:', copilot.status, 'Answer preview:', copilot.body?.answer?.slice(0, 60) + '...');

    // 6. AI Score Lead
    const score = await testEndpoint('/api/v1/ai/score-lead', 'POST', {
      serviceInterest: 'Ultra Deep Villa Sanitization',
      source: 'AI Inbound Call',
      estimatedValue: 750,
      urgency: 'urgent'
    });
    console.log('6. AI Lead Scoring:', score.status, 'Score:', score.body?.evaluation?.score, 'Conversion Prob:', score.body?.evaluation?.conversionProb + '%');

    // 7. Automation Engine Lead Creation Trigger
    const newLead = await testEndpoint('/api/v1/leads', 'POST', {
      name: 'Victoria Sterling-Fox',
      phone: '+1 (555) 992-0044',
      serviceInterest: 'Ultra Deep Villa Sanitization',
      source: 'Website Form',
      priority: 'high',
      estimatedValue: 650
    });
    console.log('7. Create Lead (Triggering Automation Engine):', newLead.status, 'Lead ID:', newLead.body?.lead?.id, 'Score:', newLead.body?.lead?.aiScore);

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    serverProcess.kill();
    console.log('--- Test Completed & Server Process Terminated ---');
  }
};

run();
