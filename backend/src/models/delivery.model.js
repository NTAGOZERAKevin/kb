import { randomUUID } from 'node:crypto';
import { collection } from '../config/db.js';
import { isUuid, mapDeliveryZone } from '../db/rows.js';

function zones() {
  return collection('deliveryZones');
}

// These are the locations the shop already offered. They are written to the
// database the first time delivery locations are read, so the owner can then
// edit them (and add new ones) from the dashboard.
export const DEFAULT_DELIVERY_ZONES = [
  {
    value: 'same_day',
    label: 'Same Day Delivery',
    areas: 'Kigali city centre and nearby neighbourhoods',
    eta: '2–3 hours',
    fee: 2000,
  },
  {
    value: 'uptown',
    label: 'Uptown Delivery',
    areas: 'Rusororo, Gahanga, Kwa Mushimire and more',
    eta: '1 business day',
    fee: 2800,
  },
  {
    value: 'express',
    label: 'Express Delivery',
    areas: 'Priority rider, not more than 4 items',
    eta: 'Within 1 hour',
    fee: 3000,
  },
  {
    value: 'up_country',
    label: 'Up-Country',
    areas: 'Rubavu, Huye, Rusizi, Musanze and more',
    eta: '1–2 business days',
    fee: 3000,
  },
  {
    value: 'deluxe',
    label: 'Deluxe Delivery',
    areas: 'Delivered by private car',
    eta: '1 business day',
    fee: 15000,
  },
];

function slugify(label) {
  return (
    String(label)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'location'
  );
}

export const DeliveryZone = {
  async ensureDefaults() {
    if ((await zones().countDocuments()) > 0) {
      return;
    }

    const now = new Date();

    await zones().insertMany(
      DEFAULT_DELIVERY_ZONES.map((zone, index) => ({
        _id: randomUUID(),
        ...zone,
        isActive: true,
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
      })),
    );
  },

  async list({ includeInactive = false } = {}) {
    await DeliveryZone.ensureDefaults();

    const documents = await zones()
      .find(includeInactive ? {} : { isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .toArray();

    return documents.map(mapDeliveryZone);
  },

  async findById(id) {
    if (!isUuid(id)) {
      return null;
    }

    return mapDeliveryZone(await zones().findOne({ _id: id }));
  },

  async create({ label, areas, eta, fee, isActive = true }) {
    const base = slugify(label);
    let value = base;
    let suffix = 2;

    while (await zones().findOne({ value }, { projection: { _id: 1 } })) {
      value = `${base}_${suffix}`;
      suffix += 1;
    }

    const last = await zones().find().sort({ sortOrder: -1 }).limit(1).next();
    const now = new Date();
    const document = {
      _id: randomUUID(),
      value,
      label,
      areas,
      eta,
      fee,
      isActive,
      sortOrder: (last?.sortOrder ?? 0) + 1,
      createdAt: now,
      updatedAt: now,
    };

    await zones().insertOne(document);

    return mapDeliveryZone(document);
  },

  async update(id, updates) {
    if (!isUuid(id)) {
      return null;
    }

    const current = await zones().findOne({ _id: id });

    if (!current) {
      return null;
    }

    const next = { updatedAt: new Date() };

    for (const field of ['label', 'areas', 'eta', 'fee', 'isActive']) {
      if (updates[field] !== undefined) {
        next[field] = updates[field];
      }
    }

    const updated = await zones().findOneAndUpdate(
      { _id: id },
      { $set: next },
      { returnDocument: 'after' },
    );

    return mapDeliveryZone(updated);
  },

  async remove(id) {
    if (!isUuid(id)) {
      return null;
    }

    return mapDeliveryZone(await zones().findOneAndDelete({ _id: id }));
  },
};
