import Order from "../models/orderModels.js";
import { userModel } from "../models/usermodels.js";
import { normalizeStatus } from "../utils/analyticsHelpers.js";
/* ================= DATE ================= */
const getStartDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - Number(days || 7));
  return d;
};

/* ================= ORDERS (SINGLE SOURCE OF TRUTH) ================= */
const getOrders = async (days) => {
  const startDate = getStartDate(days);

  return await Order.find({
  createdAt: {
    $gte: startDate,
    $lte: new Date(),
  },
})
};

/* ================= REVENUE ================= */
export const getSalesRevenueReport = async (req, res) => {
  try {
    const { days } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days || 7));

    const orders = await Order.find({
      paymentMethod: "COD",
      createdAt: { $gte: startDate },
    }).lean();

    const revenue = orders.reduce((sum, o) => {
      if (o.status === "cancelled") return sum;
      return sum + (o.amount || 0);
    }, 0);

    res.json({
      success: true,
      revenue,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



/* ================= TOP PRODUCTS (NO DUPLICATE BUG) ================= */
export const fetchTopSellingProducts = async (req, res) => {
  try {
    const { days } = req.query;

    const orders = await getOrders(days);

    const map = new Map();

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const snap = item.snapshot || {};

        const id = item.productId?.toString() || snap.name;

        const name = snap.name || "Unknown Product";
        const image = snap.image || "";

        if (!map.has(id)) {
          map.set(id, {
            _id: id,
            name,
            image,
            sold: 0,
          });
        }

        map.get(id).sold += Number(item.quantity || 1);
      });
    });

    res.json({
      success: true,
      products: Array.from(map.values()),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= CLV ================= */
export const getCLV = async (req, res) => {
  try {
    const users = await userModel.countDocuments();
    const orders = await Order.find({ payment: true }).lean();

    const revenue = orders.reduce((a, b) => a + (b.amount || 0), 0);

    res.json({
      success: true,
      clv: users ? revenue / users : 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= FORECAST (REAL TREND MODEL) ================= */
export const getForecast = async (req, res) => {
  try {
    const orders = await Order.find({ payment: true }).lean();

    const last7 = Array(7).fill(0);

    const now = new Date();

    orders.forEach((o) => {
      const diff = Math.floor(
        (now - new Date(o.createdAt)) / (1000 * 60 * 60 * 24)
      );

      if (diff >= 0 && diff < 7) {
        last7[diff] += o.amount || 0;
      }
    });

    // simple trend growth model
    const forecast = last7
      .reverse()
      .map((v, i) => Math.round(v * (1 + i * 0.05)));

    res.json({
      success: true,
      forecast,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/// =========get Order Summary===========
export const getOrderStatusSummary = async (req, res) => {
  try {
    const { days } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days || 7));

    const orders = await Order.find({
      createdAt: { $gte: startDate }
    }).lean();

    const summary = {
      placed: { count: 0, revenue: 0 },
      packing: { count: 0, revenue: 0 },
      shipped: { count: 0, revenue: 0 },
      out_of_delivery: { count: 0, revenue: 0 },
      delivered: { count: 0, revenue: 0 },
      cancelled: { count: 0, revenue: 0 },
    };

    orders.forEach((o) => {
      const status = (o.status || "").toLowerCase();

      let key = "placed";
      if (status.includes("pack")) key = "packing";
      else if (status.includes("ship")) key = "shipped";
      else if (status.includes("out")) key = "out_of_delivery";
      else if (status.includes("deliver")) key = "delivered";
      else if (status.includes("cancel")) key = "cancelled";

      summary[key].count += 1;

      if (key !== "cancelled") {
        summary[key].revenue += o.amount || 0;
      }
    });

    res.json({
      success: true,
      summary,
      totalOrders: orders.length,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
//====================Get Order Funnel=============
export const getOrderFunnel = async (req, res) => {
  try {
    const { days } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days || 7));

    const orders = await Order.find({
      createdAt: { $gte: startDate },
    }).lean();

    const funnel = {
      placed: 0,
      packing: 0,
      shipped: 0,
      out_of_delivery: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((o) => {
      const s = (o.status || "").toLowerCase();

      if (s.includes("pending")) funnel.placed++;
      else if (s.includes("pack")) funnel.packing++;
      else if (s.includes("ship")) funnel.shipped++;
      else if (s.includes("out")) funnel.out_of_delivery++;
      else if (s.includes("deliver")) funnel.delivered++;
      else if (s.includes("cancel")) funnel.cancelled++;
    });

    const conversionRate =
      orders.length ? (funnel.delivered / orders.length) * 100 : 0;

    res.json({
      success: true,
      funnel,
      conversionRate: conversionRate.toFixed(2),
      totalOrders: orders.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
//================Get Order Analytics===============


export const getOrderAnalytics = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const date = new Date();
    date.setDate(date.getDate() - Number(days));

    const orders = await Order.find({
      createdAt: { $gte: date },
    }).lean();

    const summary = {
      order_placed: { count: 0, revenue: 0 },
      packing: { count: 0, revenue: 0 },
      shipped: { count: 0, revenue: 0 },
      out_for_delivery: { count: 0, revenue: 0 },
      delivered: { count: 0, revenue: 0 },
      cancelled: { count: 0, revenue: 0 },
    };

    let totalRevenue = 0;

    orders.forEach((o) => {
      const key = normalizeStatus(o.status);

      summary[key].count += 1;

      if (key !== "cancelled") {
        summary[key].revenue += o.amount || 0;
      }

      totalRevenue += o.amount || 0;
    });

    res.json({
      success: true,
      orders: summary,
      revenue: totalRevenue,
      totalOrders: orders.length,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//========Get New User Registrations Count=====
export const getNewUserRegistrationsCount = async (req, res) => {
  try {
    const { days } = req.query;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // IMPORTANT FIX (normalize)
    startDate.setDate(startDate.getDate() - Number(days || 1));

    const endDate = new Date();

    const count = await userModel.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    res.json({
      success: true,
      count,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//================get insight ========
export const getInsight = async (req, res) => {
  try {
    const { days } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days || 7));

    const orders = await Order.find({
      payment: true,
      createdAt: { $gte: startDate },
    }).lean();

    const revenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

    const previousStart = new Date();
    previousStart.setDate(previousStart.getDate() - Number(days || 14));

    const previousOrders = await Order.find({
      payment: true,
      createdAt: {
        $gte: previousStart,
        $lte: startDate,
      },
    }).lean();

    const prevRevenue = previousOrders.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );

    const growth =
      prevRevenue === 0
        ? 100
        : ((revenue - prevRevenue) / prevRevenue) * 100;

    const alert =
      growth < -20
        ? "⚠️ Sales Dropping"
        : growth > 30
        ? "🚀 Strong Growth"
        : "⚡ Stable";

    res.json({
      success: true,
      revenue,
      orders: orders.length,
      growth: growth.toFixed(2),
      alert,
      profit: revenue * 0.35, // mock profit (35% margin)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// simple moving average prediction
export const getMLPrediction = async (req, res) => {
  const orders = await Order.find({ payment: true });

  const daily = {};

  orders.forEach(o => {
    const date = new Date(o.createdAt).toISOString().split("T")[0];
    daily[date] = (daily[date] || 0) + o.amount;
  });

  const values = Object.values(daily);

  const avg = values.reduce((a,b)=>a+b,0) / values.length;

  const prediction = Math.round(avg * 1.15); // growth factor

  res.json({ prediction });
};


export const getProfitLoss = async (req, res) => {
  try {
    const orders = await Order.find({ payment: true }).lean();

    let revenue = 0;
    let cost = 0;

    orders.forEach((o) => {
      revenue += o.amount || 0;

      (o.items || []).forEach((item) => {
        cost += (item.costPrice || 0) * (item.quantity || 1);
      });
    });

    const profit = revenue - cost;

    res.json({
      success: true,
      revenue,
      cost,
      profit,
      status: profit > 0 ? "PROFIT 📈" : "LOSS 📉",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const checkSalesAlert = async (req, res) => {
  try {
    const today = await Order.find({
      payment: true,
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    });

    const revenue = today.reduce((a, b) => a + (b.amount || 0), 0);

    if (revenue < 2000) {
      await sendAlertEmail(
        "⚠ Sales Drop Alert",
        `Revenue today is low: ${revenue}`
      );
    }

    res.json({
      success: true,
      revenue,
      alert: revenue < 2000,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

export const getCohortAnalysis = async (req, res) => {
  try {
    const users = await userModel.find().lean();
    const orders = await Order.find().lean();

    const cohort = {};

    users.forEach((u) => {
      const joinMonth = new Date(u.createdAt).toISOString().slice(0, 7);

      if (!cohort[joinMonth]) {
        cohort[joinMonth] = {
          users: 0,
          activeBuyers: 0,
        };
      }

      cohort[joinMonth].users += 1;
    });

    orders.forEach((o) => {
      const orderMonth = new Date(o.createdAt).toISOString().slice(0, 7);

      const userMonth = users.find(
        (u) => u._id.toString() === o.userId?.toString()
      );

      if (userMonth) {
        const joinMonth = new Date(userMonth.createdAt)
          .toISOString()
          .slice(0, 7);

        if (cohort[joinMonth]) {
          cohort[joinMonth].activeBuyers += 1;
        }
      }
    });

    res.json({
      success: true,
      cohort,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMLForecast = async (req, res) => {
  try {
    const orders = await Order.find({ payment: true }).lean();

    const daily = {};

    orders.forEach((o) => {
      const d = new Date(o.createdAt).toISOString().split("T")[0];
      daily[d] = (daily[d] || 0) + o.amount;
    });

    const values = Object.values(daily);

    let weightedSum = 0;
    let weightTotal = 0;

    values.forEach((val, i) => {
      const weight = i + 1;
      weightedSum += val * weight;
      weightTotal += weight;
    });

    const trend = weightedSum / weightTotal;

    const prediction = Math.round(trend * 1.25); // growth factor

    res.json({
      success: true,
      prediction,
      trend,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};