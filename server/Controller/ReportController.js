const ReportServices = require('../Services/ReportServices');
const UserServices = require('../Services/UserServices');
class ReportController {

  static getAll = async (req, res) => {
    try {
      if (!req.query.startDate) return res.status(400).json({message: "Please provide startDate."});
      if (!req.query.endDate) return res.status(400).json({message: "Please provide endDate."});
      if (!req.query.trainer) return res.status(400).json({message: "Please provide trainer name."});

      let reports = await ReportServices.getAll(req.query);

      return res.status(200).json({ status: 200, message: 'Report Get Successfully', data: reports });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

  static get = async (req, res) => {
    try {

      if (!req.query.trainer || !(req.query.startDate && req.query.endDate)) {
        return  res.status(400).json({ message: 'Please, provide trainerId OR Start Date and End Date for the report' });
      }
      if (req.query.trainer) {
        let trainer = await UserServices.getUser(req.query.trainer);
        if (trainer.type !== 'trainer') return  res.status(400).json({ message: 'Requested user was not trainer' });
      }
      let report = await ReportServices.get(req.query);
      return res.status(200).json({ status: 200, message: 'Report Get Successfully', data: report });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err.message });
    }
  }

}

module.exports = ReportController;
