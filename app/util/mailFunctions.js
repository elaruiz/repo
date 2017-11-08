import {EMAIL_PASSWORD, EMAIL_USER, EMAIL_HOST, EMAIL_PORT, CLIENTE_WEB, EMAIL_ACCOUNT} from "../constants/index"
import moment from 'moment';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';

const smtpTransport = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
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
export const sendMail= (token, user) => {
    const data = {
        to: user.email,
        from: "elaruiz95@gmail.com",
        template: 'forgot-password-email',
        subject: 'Password help has arrived!',
        context: {
            url: `${CLIENTE_WEB}/reset_password?token=${token}`,
            name: user.name
        }
    };
    smtpTransport.sendMail(data, ((err, info) => {
        if(err) {
            console.log('Ocurrio un error')
        }
    }));
};

export const sendMailInvoice = (user, transaction, plan) => {
    return new Promise((resolve,reject) => {
        if(EMAIL_HOST) {
            let fecha = moment(transaction.created_at).format('DD-MM-YYYY');
            const data = {
                to: user.email,
                from: EMAIL_ACCOUNT,
                template: 'receipt',
                subject: 'Comprobante de pago',
                context: {
                    user: user,
                    date: fecha,
                    plan: plan,
                    transaction: transaction
                }
            };
            smtpTransport.sendMail(data, ((err, info) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(info)
                }
            }));
        }
        else {
            resolve();
        }
    })
};
