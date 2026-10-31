import { connectDB, disconnectDB } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { User } from '../src/models/user.model.js';

async function createAdmin() {
  if (!env.adminEmail || !env.adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env');
  }

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!strongPassword.test(env.adminPassword)) {
    throw new Error(
      'ADMIN_PASSWORD must be at least 8 characters and include uppercase, lowercase, and a number',
    );
  }

  await connectDB();

  const email = env.adminEmail.toLowerCase().trim();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    console.info(`An account already exists for ${email}. No changes were made.`);
    return;
  }

  const admin = await User.create({
    name: env.adminName,
    email,
    password: env.adminPassword,
    role: 'admin',
  });

  console.info(`Admin account created for ${admin.email}`);
}

createAdmin()
  .catch((error) => {
    console.error('Failed to create admin account', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
