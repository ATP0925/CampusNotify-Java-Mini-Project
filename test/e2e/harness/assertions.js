/**
 * CampusNotify E2E Test Suite - Core Assertion Library
 * Provides rich, deterministic assertion primitives with explicit diagnostic messages.
 */

class AssertionError extends Error {
  constructor(message, expected, actual) {
    super(message);
    this.name = 'AssertionError';
    this.expected = expected;
    this.actual = actual;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new AssertionError(message || 'Condition evaluated to falsy', true, condition);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    const msg = message || `Expected ${JSON.stringify(expected)}, but received ${JSON.stringify(actual)}`;
    throw new AssertionError(msg, expected, actual);
  }
}

function assertNotEqual(actual, expected, message) {
  if (actual === expected) {
    const msg = message || `Expected value NOT to equal ${JSON.stringify(expected)}`;
    throw new AssertionError(msg, `not ${expected}`, actual);
  }
}

function assertTrue(actual, message) {
  if (actual !== true) {
    throw new AssertionError(message || `Expected true, received ${actual}`, true, actual);
  }
}

function assertFalse(actual, message) {
  if (actual !== false) {
    throw new AssertionError(message || `Expected false, received ${actual}`, false, actual);
  }
}

function assertDeepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    const msg = message || `Deep equality mismatch:\nExpected: ${expectedStr}\nReceived: ${actualStr}`;
    throw new AssertionError(msg, expected, actual);
  }
}

function assertRoughlyEqual(actual, expected, delta = 0.001, message) {
  const diff = Math.abs(Number(actual) - Number(expected));
  if (diff > delta) {
    const msg = message || `Expected ${actual} to be within ${delta} of ${expected} (diff: ${diff})`;
    throw new AssertionError(msg, expected, actual);
  }
}

function assertMatches(actual, regex, message) {
  if (!regex.test(String(actual))) {
    const msg = message || `Expected string "${actual}" to match pattern ${regex}`;
    throw new AssertionError(msg, regex.toString(), actual);
  }
}

function assertThrows(fn, expectedErrorRegexOrType, message) {
  let threw = false;
  let caughtError = null;
  try {
    fn();
  } catch (err) {
    threw = true;
    caughtError = err;
  }

  if (!threw) {
    throw new AssertionError(message || 'Expected function to throw, but it succeeded', 'Error thrown', 'No error');
  }

  if (expectedErrorRegexOrType) {
    if (expectedErrorRegexOrType instanceof RegExp) {
      if (!expectedErrorRegexOrType.test(caughtError.message)) {
        throw new AssertionError(
          message || `Error message "${caughtError.message}" did not match ${expectedErrorRegexOrType}`,
          expectedErrorRegexOrType.toString(),
          caughtError.message
        );
      }
    } else if (typeof expectedErrorRegexOrType === 'string') {
      if (!caughtError.message.includes(expectedErrorRegexOrType)) {
        throw new AssertionError(
          message || `Error message "${caughtError.message}" did not contain "${expectedErrorRegexOrType}"`,
          expectedErrorRegexOrType,
          caughtError.message
        );
      }
    }
  }
}

async function assertRejects(asyncFn, expectedErrorRegexOrType, message) {
  let threw = false;
  let caughtError = null;
  try {
    await asyncFn();
  } catch (err) {
    threw = true;
    caughtError = err;
  }

  if (!threw) {
    throw new AssertionError(message || 'Expected async function to reject, but it resolved', 'Promise rejection', 'Resolved');
  }

  if (expectedErrorRegexOrType) {
    if (expectedErrorRegexOrType instanceof RegExp) {
      if (!expectedErrorRegexOrType.test(caughtError.message)) {
        throw new AssertionError(
          message || `Error message "${caughtError.message}" did not match ${expectedErrorRegexOrType}`,
          expectedErrorRegexOrType.toString(),
          caughtError.message
        );
      }
    } else if (typeof expectedErrorRegexOrType === 'string') {
      if (!caughtError.message.includes(expectedErrorRegexOrType)) {
        throw new AssertionError(
          message || `Error message "${caughtError.message}" did not contain "${expectedErrorRegexOrType}"`,
          expectedErrorRegexOrType,
          caughtError.message
        );
      }
    }
  }
}

module.exports = {
  AssertionError,
  assert,
  assertEqual,
  assertNotEqual,
  assertTrue,
  assertFalse,
  assertDeepEqual,
  assertRoughlyEqual,
  assertMatches,
  assertThrows,
  assertRejects
};
