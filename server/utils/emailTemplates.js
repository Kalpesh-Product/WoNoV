const emailTemplates = (email, name, password) => {
  const userMailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Welcome to Our Service!",
    html: `
          <h1>Welcome to Our Service, ${name}!</h1>
          <p>Thank you for registering with us. We'll be contacting you within 24 hours.</p>
  
          <p>Email : ${email}</p>
          <p>Password : ${password}</p>
  
          <p>Feel free to explore our services and let us know if you need any assistance.</p>
          <p>Best Regards,<br>Wono</p>
        `,
  };

  return userMailOptions;
};

module.exports = emailTemplates;
