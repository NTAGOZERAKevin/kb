import { connectDB, disconnectDB } from '../src/config/db.js';
import { migrate } from '../src/db/migrate.js';
import { Product } from '../src/models/product.model.js';
import { seedProducts } from '../src/data/products.js';

async function seed() {
  await connectDB();
  await migrate();

  let created = 0;
  let updated = 0;

  for (const product of seedProducts) {
    const existing = await Product.findByName(product.name);

    if (existing) {
      await Product.update(existing._id, product);
      updated += 1;
    } else {
      await Product.create(product);
      created += 1;
    }
  }

  console.info(`Products ready: ${created} created, ${updated} updated.`);
}

seed()
  .catch((error) => {
    console.error('Failed to seed products', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
