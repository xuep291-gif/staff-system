import { Hono } from 'hono';
import auth from './auth.js';
import orientation from './orientation.js';
import dorm from './dorm.js';
import bill from './bill.js';
import refund from './refund.js';
import scholarship from './scholarship.js';
import loan from './loan.js';
import messages from './messages.js';
import checkin from './checkin.js';
import prepay from './prepay.js';
import address from './address.js';
import orgs from './orgs.js';
import feedback from './feedback.js';
import upload from './upload.js';
import config from './config.js';

const student = new Hono();

student.route('/', auth);
student.route('/', orientation);
student.route('/', dorm);
student.route('/', bill);
student.route('/', refund);
student.route('/', scholarship);
student.route('/', loan);
student.route('/', messages);
student.route('/', checkin);
student.route('/', prepay);
student.route('/', address);
student.route('/', orgs);
student.route('/', feedback);
student.route('/', upload);
student.route('/', config);

export default student;
