import { DiscountCode, isExpired, normalizeCode } from '../models/discountCode.model.js';
import { ApiError } from '../utils/ApiError.js';

export function discountAmountFor(subtotal, code) {
  if (!code) {
    return 0;
  }

  if (code.type === 'percentage') {
    return Math.round(subtotal * (code.value / 100));
  }

  return Math.min(Number(code.value), subtotal);
}

export function assertDiscountUsable(code, subtotal) {
  if (!code || !code.isActive) {
    throw new ApiError(422, 'That discount code is not valid or has expired');
  }

  if (isExpired(code.expiresAt)) {
    const expiredOn = new Date(code.expiresAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    throw new ApiError(422, `${code.code} expired on ${expiredOn}`);
  }

  if (code.maxUses !== null && code.usedCount >= code.maxUses) {
    throw new ApiError(422, 'That discount code has already reached its usage limit');
  }

  if (subtotal < code.minSubtotal) {
    throw new ApiError(
      422,
      `Add ${new Intl.NumberFormat('en-RW').format(code.minSubtotal - subtotal)} RWF more to use ${code.code}`,
    );
  }
}

export async function resolveDiscount(rawCode, subtotal) {
  if (!normalizeCode(rawCode)) {
    return null;
  }

  const code = await DiscountCode.findByCode(rawCode);
  assertDiscountUsable(code, subtotal);

  return {
    code,
    amount: discountAmountFor(subtotal, code),
  };
}
