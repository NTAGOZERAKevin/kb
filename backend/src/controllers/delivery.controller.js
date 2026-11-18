import { DeliveryZone } from '../models/delivery.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function payloadFrom(body) {
  const payload = {};

  for (const field of ['label', 'areas', 'eta']) {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  }

  if (body.fee !== undefined) {
    payload.fee = Number(body.fee);
  }

  if (body.isActive !== undefined) {
    payload.isActive = body.isActive;
  }

  return payload;
}

async function activeCountExcept(id) {
  const methods = await DeliveryZone.list({ includeInactive: true });
  return methods.filter((method) => method.isActive && method._id !== id).length;
}

export const listDeliveryMethods = asyncHandler(async (_req, res) => {
  const methods = await DeliveryZone.list();

  res.json({ success: true, data: { methods } });
});

export const listAllDeliveryMethods = asyncHandler(async (_req, res) => {
  const methods = await DeliveryZone.list({ includeInactive: true });

  res.json({ success: true, data: { methods } });
});

export const createDeliveryMethod = asyncHandler(async (req, res) => {
  const method = await DeliveryZone.create(payloadFrom(req.body));

  res.status(201).json({
    success: true,
    message: `${method.label} is now available at checkout`,
    data: { method },
  });
});

export const updateDeliveryMethod = asyncHandler(async (req, res) => {
  const existing = await DeliveryZone.findById(req.params.id);

  if (!existing) {
    throw new ApiError(404, 'That delivery location could not be found');
  }

  if (existing.isActive && req.body.isActive === false && (await activeCountExcept(existing._id)) === 0) {
    throw new ApiError(422, 'Keep at least one delivery location available at checkout');
  }

  const method = await DeliveryZone.update(existing._id, payloadFrom(req.body));

  res.json({
    success: true,
    message: `${method.label} updated`,
    data: { method },
  });
});

export const deleteDeliveryMethod = asyncHandler(async (req, res) => {
  const existing = await DeliveryZone.findById(req.params.id);

  if (!existing) {
    throw new ApiError(404, 'That delivery location could not be found');
  }

  if (existing.isActive && (await activeCountExcept(existing._id)) === 0) {
    throw new ApiError(422, 'Keep at least one delivery location available at checkout');
  }

  const method = await DeliveryZone.remove(existing._id);

  res.json({
    success: true,
    message: `${method.label} removed from checkout`,
    data: { method },
  });
});
