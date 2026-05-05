let storeSettings = {
  currency: "$",
  timezone: "UTC",
  contactEmail: "",
  contactPhone: "",
  paymentGateways: {
    cod: true,
    stripe: true, // ✅ BOTH ON INITIALLY
  },
};

// ================= GET =================
export const getSettings = async (req, res) => {
  res.json(storeSettings);
};

// ================= TOGGLE =================
export const managePaymentGateways = async (req, res) => {
  const { gateway, status } = req.body;

  if (storeSettings.paymentGateways[gateway] !== undefined) {
    storeSettings.paymentGateways[gateway] = status;
  }

  // ✅ return FULL settings
  res.json(storeSettings);
};

// ================= UPDATE SETTINGS =================
export const updateStoreSettings = async (req, res) => {
  try {
    storeSettings = {
      ...storeSettings,
      ...req.body,
    };

    res.json(storeSettings);
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings" });
  }
};

// ================= PAYMENT TOGGLE =================

// ================= HEALTH CHECK =================
export const checkServerHealth = async (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy 🚀",
    timestamp: new Date(),
  });
};