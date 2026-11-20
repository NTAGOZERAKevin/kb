import { DiscountCode, normalizeCode } from '../models/discountCode.model.js';
import { assertDiscountUsable, discountAmountFor } from '../services/discount.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function optionalDate(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return new Date(value).toISOString();
}

function payloadFrom(body) {
  const payload = {};

  if (body.code !== undefined) {
    payload.code = normalizeCode(body.code);
  }

  for (const field of ['description', 'type', 'minSubtotal', 'maxUses', 'isActive']) {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  }

  if (body.value !== undefined) {
    payload.value = Number(body.value);
  }

  if (body.expiresAt !== undefined) {
    payload.expiresAt = optionalDate(body.expiresAt);
  }

  if (payload.type === 'percentage' && payload.value > 100) {
    throw new ApiError(422, 'A percentage discount cannot be more than 100%');
  }

  if (payload.type === 'fixed' && payload.value < 1) {
    throw new ApiError(422, 'A fixed discount must be at least 1 franc');
  }

  return payload;
}

export const listDiscountCodes = asyncHandler(async (_req, res) => {
  const codes = await DiscountCode.list();
  res.json({ success: true, data: { codes } });
});

export const createDiscountCode = asyncHandler(async (req, res) => {
  const payload = payloadFrom(req.body);

  if (await DiscountCode.codeExists(payload.code)) {
    throw new ApiError(409, 'That discount code already exists');
  }

  const code = await DiscountCode.create({
    ...payload,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: `${code.code} is ready to use at checkout`,
    data: { code },
  });
});

export const updateDiscountCode = asyncHandler(async (req, res) => {
  const existing = await DiscountCode.findById(req.params.id);

  if (!existing) {
    throw new ApiError(404, 'That discount code could not be found');
  }

  const payload = payloadFrom(req.body);
  const resultingType = payload.type ?? existing.type;
  const resultingValue = payload.value ?? existing.value;

  if (resultingType === 'percentage' && resultingValue > 100) {
    throw new ApiError(422, 'A percentage discount cannot be more than 100%');
  }

  if (payload.code && payload.code !== existing.code && (await DiscountCode.codeExists(payload.code, existing._id))) {
    throw new ApiError(409, 'That discount code already exists');
  }

  const code = await DiscountCode.update(existing._id, payload);

  res.json({
    success: true,
    message: `${code.code} updated`,
    data: { code },
  });
});

export const deleteDiscountCode = asyncHandler(async (req, res) => {
  const existing = await DiscountCode.findById(req.params.id);

  if (!existing) {
    throw new ApiError(404, 'That discount code could not be found');
  }

  const code = await DiscountCode.remove(existing._id);

  res.json({
    success: true,
    message: `${code.code} removed`,
    data: { code },
  });
});

export const validateDiscountCode = asyncHandler(async (req, res) => {
  const { code: rawCode, subtotal } = req.body;
  const code = await DiscountCode.findByCode(rawCode);

  assertDiscountUsable(code, Number(subtotal));

  res.json({
    success: true,
    data: {
      discount: {
        code: code.code,
        description: code.description,
        type: code.type,
        value: code.value,
        amount: discountAmountFor(Number(subtotal), code),
      },
    },
  });
});
