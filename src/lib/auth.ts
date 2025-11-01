// Dummy authentication system for testing
export interface User {
  email: string;
  role: 'customer' | 'employee' | 'admin';
  name: string;
}

const QUICK_ACCESS_USERS = {
  customer: {
    email: 'customer@gmail.com',
    role: 'customer' as const,
    name: 'Customer User'
  },
  employee: {
    email: 'employee@gmail.com',
    role: 'employee' as const,
    name: 'Employee User'
  },
  admin: {
    email: 'admin@gmail.com',
    role: 'admin' as const,
    name: 'Admin User'
  }
};

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem('currentUser');
  if (!stored) return null;
  return JSON.parse(stored);
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
}

export function quickAccessLogin(role: 'customer' | 'employee' | 'admin'): User {
  const user = QUICK_ACCESS_USERS[role];
  setCurrentUser(user);
  return user;
}

export function login(email: string, password: string): User {
  // Determine role based on email
  let role: 'customer' | 'employee' | 'admin' = 'customer';
  
  if (email.toLowerCase().includes('admin')) {
    role = 'admin';
  } else if (email.toLowerCase().includes('employee')) {
    role = 'employee';
  }

  const user: User = {
    email,
    role,
    name: email.split('@')[0]
  };

  setCurrentUser(user);
  return user;
}

export function createAccount(email: string, password: string, name: string): User {
  const user: User = {
    email,
    role: 'customer',
    name
  };

  setCurrentUser(user);
  return user;
}

export function logout(): void {
  setCurrentUser(null);
}
