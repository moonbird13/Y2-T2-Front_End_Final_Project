const AUTH_STORAGE_KEY = 'komrongtrip.accounts'

const defaultAccounts = [
  {
    name: 'Demo Traveler',
    email: 'demo@komrongtrip.com',
    password: 'demo1234',
  },
  {
    name: 'Guest Planner',
    email: 'guest@komrongtrip.com',
    password: 'guest1234',
  },
]

const getStoredAccounts = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultAccounts))
      return [...defaultAccounts]
    }
    return JSON.parse(stored)
  } catch (error) {
    return [...defaultAccounts]
  }
}

const saveAccounts = (accounts) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(accounts))
  } catch (error) {
    // ignore storage failures
  }
}

let accounts = getStoredAccounts()

const normalizeEmail = (email) => email.trim().toLowerCase()

export function loginAccount({ email, password }) {
  const normalizedEmail = normalizeEmail(email)
  const account = accounts.find((item) => item.email === normalizedEmail)

  if (!account) {
    return {
      ok: false,
      error: 'No account found with that email. Please sign up first.',
    }
  }

  if (account.password !== password) {
    return {
      ok: false,
      error: 'Incorrect password. Please try again.',
    }
  }

  return {
    ok: true,
    user: {
      name: account.name,
      email: account.email,
    },
  }
}

export function signupAccount({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email)
  const existing = accounts.some((item) => item.email === normalizedEmail)

  if (existing) {
    return {
      ok: false,
      error: 'That email is already registered. Please log in instead.',
    }
  }

  const newAccount = {
    name: name.trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    password,
  }

  accounts.push(newAccount)
  saveAccounts(accounts)

  return {
    ok: true,
    user: {
      name: newAccount.name,
      email: newAccount.email,
    },
  }
}

export function getDefaultAccountsHint() {
  return accounts.map((item) => ({
    email: item.email,
    password: item.password,
  }))
}
