import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import userUtils from '../utils/user';
import UsersController from './UsersController';

describe('UsersController', () => {
  describe('signUp', () => {
    it('should create a new user', async () => {
      const req = { body: { email: 'test@example.com', password: 'password' } };
      const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
      sinon.stub(dbClient.users, 'findOne').resolves(null);
      sinon.stub(dbClient.users, 'insertOne').resolves({ insertedId: 'someid' });
      sinon.stub(bcrypt, 'hash').resolves('hashedPassword');

      await UsersController.signUp(req, res);

      sinon.assert.calledWith(res.status, 201);
      sinon.assert.calledOnce(res.send);
      expect(res.send.firstCall.args[0]).to.deep.equal({ id: 'someid', email: req.body.email });
    });
  });

  describe('logIn', () => {
    it('should log in the user', async () => {
      const req = { body: { email: 'test@example.com', password: 'password' } };
      const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
      sinon.stub(dbClient.users, 'findOne').resolves({ email: 'test@example.com', password: 'hashedPassword' });
      sinon.stub(bcrypt, 'compare').resolves(true);
      sinon.stub(userUtils, 'generateAuthToken').returns('token');
      sinon.stub(redisClient, 'set').resolves();

      await UsersController.logIn(req, res);

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledOnce(res.send);
      expect(res.send.firstCall.args[0]).to.deep.equal({ message: 'Authentication successful', authToken: 'token' });
    });
  });

  describe('logOut', () => {
    it('should log out the user', async () => {
      const req = { header: sinon.stub().withArgs('X-Token').returns('token') };
      const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
      sinon.stub(userUtils, 'getUserIdAndKey').resolves('userId');
      sinon.stub(redisClient, 'del').resolves();

      await UsersController.logOut(req, res);

      sinon.assert.calledWith(res.status, 204);
      sinon.assert.calledOnce(res.send);
      expect(res.send.firstCall.args[0]).to.deep.equal({ message: 'Logout successful' });
    });
  });

  describe('getUser', () => {
    it('should get user details', async () => {
      const req = { header: sinon.stub().withArgs('X-Token').returns('token') };
      const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
      sinon.stub(userUtils, 'getUserIdAndKey').resolves('userId');
      sinon.stub(dbClient.users, 'findOne').resolves({ _id: new ObjectId('userId'), email: 'test@example.com' });

      await UsersController.getUser(req, res);

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledOnce(res.send);
      expect(res.send.firstCall.args[0]).to.deep.equal({ id: 'userId', email: 'test@example.com' });
    });
  });
});