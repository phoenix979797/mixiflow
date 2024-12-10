const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { users, apps } = require("../models");
const logger = require("../utils/logger");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    if (user.status === "block") {
      return res.status(404).json({
        message: "Sorry, You are blocked. Please contact support team",
      });
    }

    await users.update({ lastLogin: new Date() }, { where: { id: user.id } });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res
      .status(200)
      .json({ message: "Login successful", token, role: user.role });
  } catch (error) {
    logger.error("Login error:", { error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Failed to login" });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await users.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await users.create({ email, password: hashedPassword });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    logger.error("Register error:", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ message: "Failed to register" });
  }
};

exports.googleLogin = async (req, res) => {
  const { access_token } = req.body;
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const userInfoResponse = await client.getTokenInfo(access_token);
    const email = userInfoResponse.email;

    let user = await users.findOne({ where: { email } });

    // If user doesn't exist, create one
    if (!user) {
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await users.create({
        email,
        password: hashedPassword, // Random password for Google users
      });
    }

    if (user.status === "block") {
      return res.status(403).json({
        message: "Sorry, You are blocked. Please contact support team",
      });
    }

    await users.update({ lastLogin: new Date() }, { where: { id: user.id } });
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    logger.error("Google login error:", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ message: "Failed to login with Google" });
  }
};

exports.microsoftLogin = async (req, res) => {
  const { access_token } = req.body;
  try {
    const client = new OAuth2Client(process.env.MICROSOFT_CLIENT_ID);
    const userInfoResponse = await client.getTokenInfo(access_token);
    const email = userInfoResponse.email;

    let user = await users.findOne({ where: { email } });

    if (!user) {
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await users.create({
        email,
        password: hashedPassword, // Random password for Google users
      });
    }

    if (user.status === "block") {
      return res.status(403).json({
        message: "Sorry, You are blocked. Please contact support team",
      });
    }

    await users.update({ lastLogin: new Date() }, { where: { id: user.id } });
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    logger.error("Microsoft login error:", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ message: "Failed to login with Microsoft" });
  }
};

exports.notionLogin = async (req, res) => {
  try {
    const { code } = req.body;

    // Exchange the authorization code for an access token
    const response = await axios.post(
      "https://api.notion.com/v1/oauth/token",
      {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.NOTION_REDIRECT_URI,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Return the access token and other relevant data
    res.json({
      access_token: response.data.access_token,
      workspace_id: response.data.workspace_id,
      workspace_name: response.data.workspace_name,
      workspace_icon: response.data.workspace_icon,
      bot_id: response.data.bot_id,
    });
  } catch (error) {
    console.error("Notion OAuth error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to complete Notion authentication",
      details: error.response?.data || error.message,
    });
  }
};

exports.twitterLogin = async (req, res) => {
  try {
    const { code, codeVerifier } = req.body;

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      "https://api.twitter.com/2/oauth2/token",
      new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: process.env.TWITTER_CLIENT_ID,
        redirect_uri: process.env.TWITTER_REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    res.json({
      access_token: tokenResponse.data.access_token,
      refresh_token: tokenResponse.data.refresh_token,
      expires_in: tokenResponse.data.expires_in,
    });
  } catch (error) {
    console.error(
      "Twitter OAuth error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to complete Twitter authentication",
      details: error.response?.data || error.message,
    });
  }
};

exports.instagramLogin = async (req, res) => {
  try {
    const { code } = req.body;

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        code: code,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Get long-lived access token
    const longLivedTokenResponse = await axios.get(
      "https://graph.instagram.com/access_token",
      {
        params: {
          grant_type: "ig_exchange_token",
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
          access_token: tokenResponse.data.access_token,
        },
      }
    );

    // Get basic profile information
    const userResponse = await axios.get("https://graph.instagram.com/me", {
      params: {
        fields: "id,username",
        access_token: longLivedTokenResponse.data.access_token,
      },
    });

    res.json({
      access_token: longLivedTokenResponse.data.access_token,
      expires_in: longLivedTokenResponse.data.expires_in,
      user_id: userResponse.data.id,
      username: userResponse.data.username,
    });
  } catch (error) {
    console.error(
      "Instagram OAuth error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to complete Instagram authentication",
      details: error.response?.data || error.message,
    });
  }
};

exports.linkedinLogin = async (req, res) => {
  try {
    const { code } = req.body;

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Get user profile information
    const userResponse = await axios.get("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${tokenResponse.data.access_token}`,
        "cache-control": "no-cache",
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    // Get user email address
    const emailResponse = await axios.get(
      "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
          "cache-control": "no-cache",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    res.json({
      access_token: tokenResponse.data.access_token,
      expires_in: tokenResponse.data.expires_in,
      user: {
        id: userResponse.data.id,
        firstName: userResponse.data.localizedFirstName,
        lastName: userResponse.data.localizedLastName,
        email: emailResponse.data.elements[0]["handle~"].emailAddress,
      },
    });
  } catch (error) {
    console.error(
      "LinkedIn OAuth error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to complete LinkedIn authentication",
      details: error.response?.data || error.message,
    });
  }
};

exports.calendlyLogin = async (req, res) => {
  try {
    const { code, workspaceId } = req.body;

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      "https://auth.calendly.com/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: process.env.CALENDLY_CLIENT_ID,
        client_secret: process.env.CALENDLY_CLIENT_SECRET,
        code,
        redirect_uri: process.env.CALENDLY_REDIRECT_URI,
        // code_verifier: "s3cr3tRandomString",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Get user information
    const userResponse = await axios.get("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${tokenResponse.data.access_token}`,
        "Content-Type": "application/json",
      },
    });

    const resData = {
      access_token: tokenResponse.data.access_token,
      refresh_token: tokenResponse.data.refresh_token,
      expires_in: tokenResponse.data.expires_in,
      user: {
        uri: userResponse.data.resource.uri,
        name: userResponse.data.resource.name,
        email: userResponse.data.resource.email,
        schedulingUrl: userResponse.data.resource.scheduling_url,
        timezone: userResponse.data.resource.timezone,
      },
    };

    await apps.update(
      {
        app_key: JSON.stringify(resData),
        status: "active",
      },
      { where: { workspace_id: workspaceId, app_type: "calendly" } }
    );

    res.json(resData);
  } catch (error) {
    console.error(
      "Calendly OAuth error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to complete Calendly authentication",
      details: error.response?.data || error.message,
    });
  }
};

exports.tiktokLogin = async (req, res) => {
  try {
    const { code } = req.body;

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      "https://open-api.tiktok.com/oauth/access_token/",
      new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, open_id } = tokenResponse.data.data;

    // Get user information
    const userResponse = await axios.get(
      "https://open-api.tiktok.com/user/info/",
      {
        params: {
          access_token,
          open_id,
          fields: ["open_id", "union_id", "avatar_url", "display_name"],
        },
      }
    );

    res.json({
      access_token,
      open_id,
      expires_in: tokenResponse.data.data.expires_in,
      refresh_token: tokenResponse.data.data.refresh_token,
      refresh_expires_in: tokenResponse.data.data.refresh_expires_in,
      user: {
        openId: userResponse.data.data.user.open_id,
        unionId: userResponse.data.data.user.union_id,
        avatarUrl: userResponse.data.data.user.avatar_url,
        displayName: userResponse.data.data.user.display_name,
      },
    });
  } catch (error) {
    console.error("TikTok OAuth error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to complete TikTok authentication",
      details: error.response?.data || error.message,
    });
  }
};

exports.microsoftTeamsLogin = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const tenantId = process.env.MICROSOFT_TENANT_ID;

    const response = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        refresh_token,
        grant_type: "refresh_token",
        scope: [
          "User.Read",
          "Team.ReadBasic.All",
          "Channel.ReadBasic.All",
          "ChannelMessage.Read.All",
          "ChannelMessage.Send",
          "offline_access",
        ].join(" "),
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
    });
  } catch (error) {
    console.error(
      "Microsoft Teams token refresh error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to refresh Microsoft Teams token",
      details: error.response?.data || error.message,
    });
  }
};

exports.microsoftWordLogin = async (req, res) => {
  try {
    const { code } = req.body;
    const tenantId = process.env.MICROSOFT_TENANT_ID;

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
        scope: [
          "User.Read",
          "Files.ReadWrite",
          "Files.ReadWrite.All",
          "Sites.ReadWrite.All",
          "offline_access",
        ].join(" "),
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Get user information
    const userResponse = await axios.get(
      "https://graph.microsoft.com/v1.0/me",
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      }
    );

    // Get recent Word documents
    const documentsResponse = await axios.get(
      "https://graph.microsoft.com/v1.0/me/drive/root/search(q='.docx')?$top=10&$orderby=lastModifiedDateTime desc",
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      }
    );

    res.json({
      access_token: tokenResponse.data.access_token,
      refresh_token: tokenResponse.data.refresh_token,
      expires_in: tokenResponse.data.expires_in,
      user: {
        id: userResponse.data.id,
        displayName: userResponse.data.displayName,
        email: userResponse.data.userPrincipalName,
      },
      recentDocuments: documentsResponse.data.value.map((doc) => ({
        id: doc.id,
        name: doc.name,
        webUrl: doc.webUrl,
        lastModified: doc.lastModifiedDateTime,
      })),
    });
  } catch (error) {
    console.error(
      "Microsoft Word OAuth error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to complete Microsoft Word authentication",
      details: error.response?.data || error.message,
    });
  }
};

exports.outlookLogin = async (req, res) => {
  try {
    const { code } = req.body;
    const tenantId = process.env.MICROSOFT_TENANT_ID;

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
        scope: [
          "User.Read",
          "Mail.Read",
          "Mail.Send",
          "Mail.ReadWrite",
          "Calendars.ReadWrite",
          "Contacts.Read",
          "offline_access",
        ].join(" "),
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Get user information
    const userResponse = await axios.get(
      "https://graph.microsoft.com/v1.0/me",
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      }
    );

    // Get mailbox settings
    const mailboxResponse = await axios.get(
      "https://graph.microsoft.com/v1.0/me/mailboxSettings",
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      }
    );

    // Get recent messages
    const messagesResponse = await axios.get(
      "https://graph.microsoft.com/v1.0/me/messages?$top=10&$orderby=receivedDateTime desc",
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      }
    );

    res.json({
      access_token: tokenResponse.data.access_token,
      refresh_token: tokenResponse.data.refresh_token,
      expires_in: tokenResponse.data.expires_in,
      user: {
        id: userResponse.data.id,
        displayName: userResponse.data.displayName,
        email: userResponse.data.userPrincipalName,
        mailboxSettings: {
          timezone: mailboxResponse.data.timeZone,
          language: mailboxResponse.data.language?.displayName,
          automaticRepliesSetting: mailboxResponse.data.automaticRepliesSetting,
        },
      },
      recentMessages: messagesResponse.data.value.map((msg) => ({
        id: msg.id,
        subject: msg.subject,
        from: msg.from?.emailAddress,
        receivedDateTime: msg.receivedDateTime,
        isRead: msg.isRead,
      })),
    });
  } catch (error) {
    console.error(
      "Outlook OAuth error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to complete Outlook authentication",
      details: error.response?.data || error.message,
    });
  }
};

exports.slackLogin = async (req, res) => {
  try {
    const { code } = req.body;

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      "https://slack.com/api/oauth.v2.access",
      new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: process.env.SLACK_REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!tokenResponse.data.ok) {
      throw new Error(tokenResponse.data.error);
    }

    // Get user information
    const userResponse = await axios.get(
      "https://slack.com/api/users.identity",
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.authed_user.access_token}`,
        },
      }
    );

    if (!userResponse.data.ok) {
      throw new Error(userResponse.data.error);
    }

    // Get workspace information
    const workspaceResponse = await axios.get(
      "https://slack.com/api/team.info",
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      }
    );

    if (!workspaceResponse.data.ok) {
      throw new Error(workspaceResponse.data.error);
    }

    res.json({
      access_token: tokenResponse.data.access_token,
      authed_user: {
        id: tokenResponse.data.authed_user.id,
        access_token: tokenResponse.data.authed_user.access_token,
        token_type: tokenResponse.data.authed_user.token_type,
      },
      team: {
        id: workspaceResponse.data.team.id,
        name: workspaceResponse.data.team.name,
        domain: workspaceResponse.data.team.domain,
      },
      user: {
        id: userResponse.data.user.id,
        name: userResponse.data.user.name,
        email: userResponse.data.user.email,
      },
      scope: tokenResponse.data.scope,
      bot_user_id: tokenResponse.data.bot_user_id,
    });
  } catch (error) {
    console.error("Slack OAuth error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to complete Slack authentication",
      details: error.response?.data || error.message,
    });
  }
};

exports.calcomLogin = async (req, res) => {
  try {
    const { code } = req.body;

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      "https://api.cal.com/oauth/token",
      {
        client_id: process.env.CALCOM_CLIENT_ID,
        client_secret: process.env.CALCOM_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.CALCOM_REDIRECT_URI,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Get user information
    const userResponse = await axios.get("https://api.cal.com/v1/me", {
      headers: {
        Authorization: `Bearer ${tokenResponse.data.access_token}`,
      },
    });

    // Get user's event types
    const eventTypesResponse = await axios.get(
      "https://api.cal.com/v1/event-types",
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      }
    );

    res.json({
      access_token: tokenResponse.data.access_token,
      refresh_token: tokenResponse.data.refresh_token,
      expires_in: tokenResponse.data.expires_in,
      user: {
        id: userResponse.data.id,
        name: userResponse.data.name,
        email: userResponse.data.email,
        username: userResponse.data.username,
        timeZone: userResponse.data.timeZone,
      },
      eventTypes: eventTypesResponse.data.event_types,
    });
  } catch (error) {
    console.error(
      "Cal.com OAuth error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to complete Cal.com authentication",
      details: error.response?.data || error.message,
    });
  }
};

exports.stripeLogin = async (req, res) => {
  try {
    const { code } = req.body;

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      "https://connect.stripe.com/oauth/token",
      new URLSearchParams({
        client_secret: process.env.STRIPE_SECRET_KEY,
        grant_type: "authorization_code",
        code,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Get account information
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const account = await stripe.accounts.retrieve(
      tokenResponse.data.stripe_user_id
    );

    res.json({
      access_token: tokenResponse.data.access_token,
      refresh_token: tokenResponse.data.refresh_token,
      stripe_user_id: tokenResponse.data.stripe_user_id,
      stripe_publishable_key: tokenResponse.data.stripe_publishable_key,
      account: {
        id: account.id,
        business_type: account.business_type,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        capabilities: account.capabilities,
        default_currency: account.default_currency,
        email: account.email,
      },
    });
  } catch (error) {
    console.error("Stripe OAuth error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to complete Stripe authentication",
      details: error.response?.data || error.message,
    });
  }
};

exports.whatsappLogin = async (req, res) => {
  try {
    const { code } = req.body;

    // Exchange the authorization code for an access token
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v17.0/oauth/access_token",
      {
        params: {
          client_id: process.env.META_CLIENT_ID,
          client_secret: process.env.META_CLIENT_SECRET,
          redirect_uri: process.env.WHATSAPP_REDIRECT_URI,
          code,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get WhatsApp Business Account information
    const wababResponse = await axios.get(
      "https://graph.facebook.com/v17.0/me/whatsapp_business_account",
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    // Get phone numbers associated with the account
    const phoneNumbersResponse = await axios.get(
      `https://graph.facebook.com/v17.0/${wababResponse.data.data[0].id}/phone_numbers`,
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    // Get business profile information
    const businessProfileResponse = await axios.get(
      `https://graph.facebook.com/v17.0/${wababResponse.data.data[0].id}`,
      {
        params: {
          fields: "name,messaging_limit,messaging_limit_timezone",
          access_token: accessToken,
        },
      }
    );

    res.json({
      access_token: accessToken,
      expires_in: tokenResponse.data.expires_in,
      whatsapp_business_account: {
        id: wababResponse.data.data[0].id,
        name: businessProfileResponse.data.name,
        messaging_limit: businessProfileResponse.data.messaging_limit,
        messaging_limit_timezone:
          businessProfileResponse.data.messaging_limit_timezone,
        phone_numbers: phoneNumbersResponse.data.data.map((phone) => ({
          id: phone.id,
          display_phone_number: phone.display_phone_number,
          verified_name: phone.verified_name,
          quality_rating: phone.quality_rating,
        })),
      },
    });
  } catch (error) {
    console.error(
      "WhatsApp OAuth error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to complete WhatsApp authentication",
      details: error.response?.data || error.message,
    });
  }
};
