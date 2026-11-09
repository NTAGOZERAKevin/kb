import { Order } from '../models/order.model.js';
import { User } from '../models/user.model.js';
import { recordActivity } from '../services/activityLog.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const defaultLimit = 12;
const maxLimit = 48;

function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}

function statusFilter(status) {
  if (status === 'active') {
    return true;
  }

  if (status === 'inactive') {
    return false;
  }

  return undefined;
}

export const listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const filters = { isActive: statusFilter(req.query.status), search: req.query.q };

  const [customers, total, summary] = await Promise.all([
    User.listCustomers({ ...filters, limit, offset }),
    User.countCustomers(filters),
    User.customerSummary(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
  ]);

  res.json({
    success: true,
    data: {
      customers,
      summary: {
        total: summary.total,
        active: summary.total - summary.inactive,
        inactive: summary.inactive,
        newThisMonth: summary.new_this_month,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    },
  });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await User.findCustomerById(req.params.id);

  if (!customer) {
    throw new ApiError(404, 'That customer could not be found');
  }

  const [orders, stats] = await Promise.all([
    Order.listByUser(customer._id, 10),
    Order.statsForUser(customer._id),
  ]);

  res.json({
    success: true,
    data: {
      customer: {
        ...customer,
        orderCount: stats.count,
        totalSpent: stats.total,
      },
      orders,
    },
  });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await User.setActive(req.params.id, req.body.isActive);

  if (!customer) {
    throw new ApiError(404, 'That customer could not be found');
  }

  await recordActivity({
    userId: req.user._id,
    action: customer.isActive ? 'customer.activated' : 'customer.deactivated',
    req,
    metadata: { customer: customer.email },
  });

  res.json({
    success: true,
    message: customer.isActive
      ? `${customer.name} can sign in again`
      : `${customer.name} can no longer sign in`,
    data: { customer },
  });
});
