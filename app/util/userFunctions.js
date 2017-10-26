'use strict';

import bcrypt from 'bcryptjs';
import {EMAIL_PASSWORD, EMAIL_USER, EMAIL_SERVICE} from "../constants/index"
import {host} from "../server";
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';

const smtpTransport = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    }
});

const handlebarsOptions = {
    viewEngine: 'handlebars',
    viewPath: './dist/templates',
    extName: '.html'
};

smtpTransport.use('compile', hbs(handlebarsOptions));

export const hashPassword = (password, cb) => {
    // Generate a salt at level 10 strength
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            return cb(err, hash);
        });
    });
};

export const comparePasswords = (password, userPassword, cb) => {
    // Generate a salt at level 10 strength
    bcrypt.compare(password, userPassword, (err, isValid) => {
        return cb(err, isValid);
    });
};

export const sendMail= (token, user) => {
    const data = {
        to: user.email,
        from: EMAIL_USER,
        template: 'forgot-password-email',
        subject: 'Password help has arrived!',
        context: {
            url: `${host}/api/users/reset_password?token=${token}`,
            name: user.name
        }
    };
    smtpTransport.sendMail(data);
};

export const sendMailReminder = (users) => {
    for (let i = 0, len = users.length; i < len; i++) {
    const data = {
        to: users[i].email,
        from: EMAIL_USER,
        template: 'renewal-reminder',
        subject: 'Renewal Reminder',
        context: {
            user: users[i].name
        }
    };
    // send mail with defined transport object
    smtpTransport.sendMail(data, (error, info) => {
        if (error) {
            console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
}
};

export const sendMailInvoice= (user, transaction) => {
    const data = {
        to: user.email,
        from: EMAIL_USER,
        template: 'invoice',
        subject: 'Invoice',
        context: {
            name: user.name
        }
    };
    smtpTransport.sendMail(data);
};

