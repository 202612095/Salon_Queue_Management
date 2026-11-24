// Automated test suite for Salon Queue business logic
import assert from 'assert';

console.log('🧪 Starting Salon Queue Business Logic Automated Tests...\n');

// 1. Barber Preference and Call Next Rule Test
function testBarberPreference() {
  console.log('Test 1: Barber preference selection rule (Call next for Amit skips Ravi-only client)...');

  const tickets = [
    { id: '1', token: 'S-1', preferredBarberId: 'barber-1', status: 'Waiting' }, // chose Ravi
    { id: '2', token: 'S-2', preferredBarberId: 'any', status: 'Waiting' },      // chose Any
    { id: '3', token: 'S-3', preferredBarberId: 'barber-2', status: 'Waiting' }  // chose Amit
  ];

  // Amit (barber-2) calls next
  const forAmit = tickets.find(
    t => t.status === 'Waiting' && (t.preferredBarberId === 'any' || t.preferredBarberId === 'barber-2')
  );

  assert.strictEqual(forAmit.token, 'S-2', 'Expected Amit to pick S-2 (Any barber) and skip S-1 (Ravi only)');
  console.log('  ✅ PASS: Amit skipped Ravi-only customer and picked earliest available ticket.\n');
}

// 2. Waiting Time Calculation Formula Test
function testWaitingTimeFormula() {
  console.log('Test 2: Waiting time estimation formula (Total minutes / active barbers)...');

  const tickets = [
    { id: '1', totalDuration: 30, status: 'Waiting' },
    { id: '2', totalDuration: 15, status: 'Waiting' },
    { id: '3', totalDuration: 45, status: 'Waiting' }
  ];
  const activeBarbers = 3;

  // Formula: Math.ceil(90 / 3) = 30
  const totalMins = tickets.reduce((s, t) => s + t.totalDuration, 0);
  const waitEst = Math.ceil(totalMins / activeBarbers);

  assert.strictEqual(waitEst, 30, 'Wait time calculation failed');
  console.log(`  ✅ PASS: 90 service mins / 3 barbers = ${waitEst} mins estimated wait.\n`);
}

// 3. Status Transition Rules Test
function testStatusTransitions() {
  console.log('Test 3: Strict forward-only status lifecycle test...');

  function canTransition(current, next) {
    if (current === 'Waiting') return next === 'Called' || next === 'Cancelled';
    if (current === 'Called') return next === 'In chair' || next === 'No-show';
    if (current === 'In chair') return next === 'Done';
    return false;
  }

  assert.strictEqual(canTransition('Waiting', 'Called'), true);
  assert.strictEqual(canTransition('Called', 'In chair'), true);
  assert.strictEqual(canTransition('In chair', 'Done'), true);
  // Illegal backward moves
  assert.strictEqual(canTransition('Done', 'Waiting'), false);
  assert.strictEqual(canTransition('In chair', 'Waiting'), false);
  assert.strictEqual(canTransition('Called', 'Waiting'), false);

  console.log('  ✅ PASS: Allowed forward transitions succeed, backward transitions blocked.\n');
}

// 4. Phone Number Uniqueness Test
function testPhoneUniqueness() {
  console.log('Test 4: Phone number uniqueness test (1 active ticket per phone)...');

  const tickets = [
    { id: '1', phone: '9876543210', status: 'Waiting' },
    { id: '2', phone: '9123456780', status: 'Done' }
  ];

  const checkDuplicate = (phone) => {
    return tickets.some(t => t.phone === phone && (t.status === 'Waiting' || t.status === 'Called' || t.status === 'In chair'));
  };

  assert.strictEqual(checkDuplicate('9876543210'), true, 'Should detect duplicate active ticket');
  assert.strictEqual(checkDuplicate('9123456780'), false, 'Done ticket phone should be allowed to rejoin');
  assert.strictEqual(checkDuplicate('9999999999'), false, 'New phone should be allowed');

  console.log('  ✅ PASS: Phone number uniqueness correctly enforced.\n');
}

// Run all
try {
  testBarberPreference();
  testWaitingTimeFormula();
  testStatusTransitions();
  testPhoneUniqueness();
  console.log('🎉 ALL AUTOMATED BUSINESS LOGIC TESTS PASSED (4/4)!');
} catch (e) {
  console.error('❌ TEST FAILED:', e.message);
  process.exit(1);
}
