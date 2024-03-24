import dbClient from "../utils/db";
import mailSender from "../utils/mailSender";

const otpGenerator = require("otp-generator");

class OtpController {
  static async getOtp(req, res) {
    const { email } = req.body;

    if (!email) return res.status(400).send({ error: "Missing email" });

    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
    });
    const user = await dbClient.users.findOne({ email });

    if (!user) {
      await dbClient.users.insertOne({
        email,
        otp,
      });
    } else {
      await dbClient.users.updateOne({ email }, { $set: { otp } });
    }

    return res.status(201).send({ email, otp });
  }

  static async validateOtp(req, res) {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).send({ error: "Missing data" });

    const user = await dbClient.users.findOne({ email });

    if (!user) return res.status(400).send({ error: "User not found" });

    if (user.otp !== otp) return res.status(400).send({ error: "Invalid otp" });

    await dbClient.users.updateOne({ email }, { $set: { otp: null } });

    return res.status(200).send({ email, otp });
  }

  static async sendOtp(req, res) {
    const { email } = req.body;

    if (!email) return res.status(400).send({ error: "Missing email" });

    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
    });
    const user = await dbClient.users.findOne({ email });

    if (!user) {
      await dbClient.users.insertOne({
        email,
        otp,
      });
    } else {
      await dbClient.users.updateOne({ email }, { $set: { otp } });
    }

    const title = "Your OTP";
    const body = `<h1>Your OTP is ${otp}</h1>`;

    await mailSender(email, title, body);

    return res.status(201).send({ email, otp });
  }
}

export default OtpController;
