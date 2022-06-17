const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY);

const sendEmail =(to,from,subject,text)=>{
    const msg ={
        to,
        from,
        subject,
        html:text
    };
    sgMail.send(msg,function(err,result){
        if(err){
            console.log('Email Was Not Sent!');
        } else {
            console.log('Email Was Sent.');
        }
    })
};

module.exports = sendEmail;
