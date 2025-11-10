const SessionPricingServices = require('../Services/SessionPricingServices');

class SessionPricingController {

  static getAll = async (req, res) => {
    try {
      let pricing = await SessionPricingServices.getAll();
      return res.status(200).json({ status: 200, message: 'Get session pricing successfully', data: pricing });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static getPricing = async (req, res) => {
    try {
      let pricing = await SessionPricingServices.getPricing();
      return res.status(200).json({ status: 200, message: 'Get session pricing successfully', data: pricing });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

}

module.exports = SessionPricingController;
