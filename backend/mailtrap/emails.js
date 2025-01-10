import { mailTrapClient, sender } from './mailtrap.config.js';
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from './emailTemplate.js';

export const sendVerificationEmail = async (userEmail, verificationToken) => {
  const recipients = [
    {
      email: userEmail,
    },
  ];
  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipients,
      subject: 'Verify Your Email',
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        '{verificationCode}',
        verificationToken
      ),
      category: 'Email Verification',
    });
  } catch (error) {
    console.log(`Error sending verifcation email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (userEmail, name) => {
  const recipients = [
    {
      email: userEmail,
    },
  ];
  try {
    const response = await mailTrapClient.send({
      from: sender,
      to: recipients,
      template_uuid: '059107c7-8261-4e3a-9e75-55c6194089f9',
      template_variables: {
        company_info_name: 'Shadab Company',
        name: name,
      },
    });
  } catch (error) {
    console.log(`Error sending welcome email: ${error.message}`);
  }
};

export const sendPasswordResetMail = async (userEmail, url) => {
  const recipients = [
    {
      email: userEmail,
    },
  ];
  try {
    const response = mailTrapClient.send({
      from: sender,
      to: recipients,
      subject: 'Reset Your Password',
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', url),
      category: 'Reset Password',
    });
  } catch (error) {
    console.log(`Error sending reset password email: ${error.message}`);
  }
};

export const sendPasswordUpdatedMail = async (userEmail) => {
  const recipients = [
    {
      email: userEmail,
    },
  ];
  try {
    const response = mailTrapClient.send({
      from: sender,
      to: recipients,
      subject: 'Password Updated Successfully',
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: 'Reset Password',
    });
  } catch (error) {
    console.log(`Error sending reset password success email: ${error.message}`);
  }
};
