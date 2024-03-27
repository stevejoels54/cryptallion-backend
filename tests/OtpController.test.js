import { expect } from 'chai';
import sinon from 'sinon';
import dbClient from '../utils/db';
import mailSender from '../utils/mailSender';
import OtpController from './OtpController';

describe('OtpController', () => {
  describe('getOtp', () => {
    it('should generate and return an OTP', async () => {
      const req = { body: { email: 'test@example.com' } };
      const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
      sinon.stub(dbClient.users, 'findOne').resolves(null);
      sinon.stub(dbClient.users, 'insertOne').resolves();
      sinon.stub(OtpController, 'sendOtp').resolves();

      await OtpController.getOtp(req, res);

      sinon.assert.calledWith(res.status, 201);
      sinon.assert.calledOnce(res.send);
      expect(res.send.firstCall.args[0]).to.have.property('email', req.body.email);
      expect(res.send.firstCall.args[0]).to.have.property('otp').that.is.a('string');
    });
  });

  describe('validateOtp', () => {
    it('should validate the OTP and return success if valid', async () => {
      const req = { body: { email: 'test@example.com', otp: '123456' } };
      const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
      sinon.stub(dbClient.users, 'findOne').resolves({ otp: '123456' });
      sinon.stub(dbClient.users, 'updateOne').resolves();

      await OtpController.validateOtp(req, res);

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledOnce(res.send);
      expect(res.send.firstCall.args[0]).to.have.property('email', req.body.email);
      expect(res.send.firstCall.args[0]).to.have.property('otp', req.body.otp);
    });

    it('should return error if OTP is invalid', async () => {
      const req = { body: { email: 'test@example.com', otp: '123456' } };
      const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
      sinon.stub(dbClient.users, 'findOne').resolves({ otp: '654321' });

      await OtpController.validateOtp(req, res);

      sinon.assert.calledWith(res.status, 400);
      sinon.assert.calledOnce(res.send);
      expect(res.send.firstCall.args[0]).to.have.property('error', 'Invalid otp');
    });
  });

  describe('sendOtp', () => {
    it('should send OTP via email', async () => {
      const req = { body: { email: 'test@example.com' } };
      const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
      sinon.stub(dbClient.users, 'findOne').resolves(null);
      sinon.stub(dbClient.users, 'insertOne').resolves();
      sinon.stub(mailSender).resolves();

      await OtpController.sendOtp(req, res);

      sinon.assert.calledWith(res.status, 201);
      sinon.assert.calledOnce(res.send);
      expect(res.send.firstCall.args[0]).to.have.property('email', req.body.email);
      expect(res.send.firstCall.args[0]).to.have.property('otp').that.is.a('string');
      sinon.assert.calledWith(mailSender, req.body.email, 'Your OTP', sinon.match.any);
    });
  });
});