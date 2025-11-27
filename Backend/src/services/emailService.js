const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = new Map();
    this.init();
  }

  // Initialize email transporter and load templates
  async init() {
    try {
      // Create transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production: Use SMTP (Gmail, SendGrid, etc.)
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
      } else {
        // Development: Use Ethereal for testing
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      // Verify transporter configuration
      await this.transporter.verify();
      console.log('Email service initialized successfully');

      // Load email templates
      await this.loadTemplates();
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  // Load email templates from templates directory
  async loadTemplates() {
    try {
      const templatesPath = path.join(__dirname, '../templates/emails');

      // Ensure templates directory exists
      if (!fs.existsSync(templatesPath)) {
        fs.mkdirSync(templatesPath, { recursive: true });
        console.log('Created email templates directory');
        return;
      }

      const templateFiles = fs
        .readdirSync(templatesPath)
        .filter((file) => file.endsWith('.hbs') || file.endsWith('.handlebars'));

      for (const file of templateFiles) {
        const templateName = path.parse(file).name;
        const templateContent = fs.readFileSync(path.join(templatesPath, file), 'utf8');

        // Compile handlebars template
        const compiledTemplate = handlebars.compile(templateContent);
        this.templates.set(templateName, compiledTemplate);
      }

      console.log(`Loaded ${templateFiles.length} email templates`);
    } catch (error) {
      console.error('Failed to load email templates:', error);
    }
  }

  // Send email with template
  async sendEmail({ to, subject, template, context = {}, html, text }) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      let emailHtml = html;
      let emailText = text;

      // Use template if provided
      if (template) {
        const compiledTemplate = this.templates.get(template);
        if (!compiledTemplate) {
          throw new Error(`Email template '${template}' not found`);
        }

        emailHtml = compiledTemplate(context);

        // Generate text version from HTML if not provided
        if (!emailText) {
          emailText = this.htmlToText(emailHtml);
        }
      }

      // Prepare email options
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'ShlokaYug',
          address: process.env.EMAIL_FROM || 'noreply@shlokayug.com',
        },
        to,
        subject,
        html: emailHtml,
        text: emailText,
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      // Log email info (helpful in development)
      if (process.env.NODE_ENV !== 'production') {
        console.log('Email sent successfully:');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl:
          process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to ShlokaYug - Begin Your Sanskrit Journey',
      template: 'welcome',
      context: {
        firstName: user.profile.firstName,
        username: user.username,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      },
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    return this.sendEmail({
      to: user.email,
      subject: 'Reset Your Password - ShlokaYug',
      template: 'passwordReset',
      context: {
        firstName: user.profile.firstName,
        resetUrl,
        expiryMinutes: 10,
        supportUrl: `${process.env.FRONTEND_URL}/support`,
      },
    });
  }

  // Send email verification
  async sendEmailVerification(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    return this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email - ShlokaYug',
      template: 'emailVerification',
      context: {
        firstName: user.profile.firstName,
        verificationUrl,
        expiryHours: 24,
      },
    });
  }

  // Send course enrollment confirmation
  async sendCourseEnrollmentEmail(user, course) {
    return this.sendEmail({
      to: user.email,
      subject: `Course Enrollment Confirmed - ${course.title}`,
      template: 'courseEnrollment',
      context: {
        firstName: user.profile.firstName,
        courseTitle: course.title,
        courseUrl: `${process.env.FRONTEND_URL}/courses/${course._id}`,
        instructorName: course.instructor.profile.firstName,
      },
    });
  }

  // Send subscription confirmation
  async sendSubscriptionEmail(user, subscription) {
    return this.sendEmail({
      to: user.email,
      subject: 'Subscription Activated - ShlokaYug Premium',
      template: 'subscription',
      context: {
        firstName: user.profile.firstName,
        planName: subscription.plan,
        expiryDate: subscription.expiresAt,
        featuresUrl: `${process.env.FRONTEND_URL}/premium-features`,
      },
    });
  }

  // Send achievement notification
  async sendAchievementEmail(user, achievement) {
    return this.sendEmail({
      to: user.email,
      subject: 'New Achievement Unlocked! 🏆',
      template: 'achievement',
      context: {
        firstName: user.profile.firstName,
        achievementTitle: achievement.title,
        achievementDescription: achievement.description,
        xpEarned: achievement.xp,
        profileUrl: `${process.env.FRONTEND_URL}/profile`,
      },
    });
  }

  // Send community post notification
  async sendCommunityNotificationEmail(user, post, author) {
    return this.sendEmail({
      to: user.email,
      subject: 'New Community Activity - ShlokaYug',
      template: 'communityNotification',
      context: {
        firstName: user.profile.firstName,
        authorName: author.profile.firstName,
        postTitle: post.title,
        postUrl: `${process.env.FRONTEND_URL}/community/posts/${post._id}`,
        unsubscribeUrl: `${process.env.FRONTEND_URL}/settings/notifications`,
      },
    });
  }

  // Utility method to convert HTML to plain text
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing whitespace
  }

  // Get email service status
  getStatus() {
    return {
      isInitialized: !!this.transporter,
      templatesLoaded: this.templates.size,
      environment: process.env.NODE_ENV || 'development',
    };
  }

  // Bulk email sending with rate limiting
  async sendBulkEmails(emails, options = {}) {
    const {
      batchSize = 10,
      delay = 1000, // 1 second between batches
      template,
      context = {},
    } = options;

    const results = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      const batchPromises = batch.map(async (email) => {
        try {
          const result = await this.sendEmail({
            ...email,
            template,
            context: { ...context, ...email.context },
          });
          return { email: email.to, success: true, result };
        } catch (error) {
          return { email: email.to, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);

      // Add delay between batches
      if (i + batchSize < emails.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return results;
  }
}

// Create and export singleton instance
const emailService = new EmailService();

module.exports = {
  emailService,
  sendEmail: (emailData) => emailService.sendEmail(emailData),
};
