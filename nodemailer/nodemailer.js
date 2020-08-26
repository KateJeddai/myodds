const nodemailer = require('nodemailer');
const config = require('../backend-config/config');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.APP_ADMIN,
        pass: process.env.ADMIN_PASS
    }
});

const sendMailToRestorePass = (user, host) => {
    console.log(process.env.APP_ADMIN, process.env.ADMIN_PASS)
    const link = "http://" + host + "/new-password?token=" + user.confirmToken;    
    const mailOptions = {
        from: process.env.APP_ADMIN, 
        to: user.email, 
        subject: 'Restore your credentials', 
        html: "To restore your password click<a href=" + link + "> here</a>"
    };

    transporter.sendMail(mailOptions, function (err, info) {
                if(err) console.log(err);
                else console.log(info);
    }); 
}

module.exports = {sendMailToRestorePass};
