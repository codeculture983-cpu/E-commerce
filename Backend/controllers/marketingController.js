import PromoCode from "../models/PromoCode.js";

// Create promo code
export const createPromoCode = async (req,res)=>{
  try{
    const promo = await PromoCode.create(req.body);
    res.json(promo);
  }catch(err){ res.status(500).json({message: err.message}) }
}

// List active promo codes
export const listActiveCoupons = async (req,res)=>{
  try{
    const promos = await PromoCode.find({ active:true });
    res.json(promos);
  }catch(err){ res.status(500).json({message: err.message}) }
}

// Delete promo code
export const deletePromoCode = async (req,res)=>{
  try{
    const { id } = req.params;
    await PromoCode.findByIdAndDelete(id);
    res.json({message:"Promo deleted"});
  }catch(err){ res.status(500).json({message: err.message}) }
}