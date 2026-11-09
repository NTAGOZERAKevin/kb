import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import {
  countOrders,
  countPendingOrders,
  getPeriodTotals,
  getRevenue,
  getSalesSeries,
  getStatusBreakdown,
  getTopProducts,
  listRecentOrders,
} from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function daysAgo(days) {
  const value = startOfDay();
  value.setDate(value.getDate() - days);
  return value;
}

export const getDashboard = asyncHandler(async (_req, res) => {
  const today = startOfDay();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const weekStart = daysAgo(6);

  const [
    revenue,
    orders,
    customers,
    products,
    pendingOrders,
    todayTotals,
    monthTotals,
    recentOrders,
    lowStock,
    statusBreakdown,
    topProducts,
    salesSeries,
  ] = await Promise.all([
    getRevenue(),
    countOrders(),
    User.countCustomers(),
    Product.countActive(),
    countPendingOrders(),
    getPeriodTotals(today),
    getPeriodTotals(monthStart),
    listRecentOrders(6),
    Product.lowStock(5),
    getStatusBreakdown(),
    getTopProducts(5),
    getSalesSeries(weekStart),
  ]);

  const seriesMap = new Map(salesSeries.map((entry) => [entry.day, entry]));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = daysAgo(6 - index);
    const key = date.toISOString().slice(0, 10);
    const entry = seriesMap.get(key);
    return {
      date: key,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      total: entry?.total || 0,
      orders: entry?.orders || 0,
    };
  });

  res.json({
    success: true,
    data: {
      revenue,
      orders,
      customers,
      products,
      pendingOrders,
      todaySales: todayTotals.total,
      todayOrders: todayTotals.count,
      monthSales: monthTotals.total,
      monthOrders: monthTotals.count,
      recentOrders,
      lowStock,
      statusBreakdown,
      topProducts,
      salesSeries: days,
    },
  });
});
