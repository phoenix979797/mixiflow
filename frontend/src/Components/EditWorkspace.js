import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import backendAxios from "../utils/backendAxios";
import { useToast } from "../context/ToastContext";
import { useGoogleLogin } from "@react-oauth/google";
import { generateCodeVerifier, generateCodeChallenge } from "../utils/pkce";

const EditWorkspace = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [workspace, setWorkspace] = useState(null);
  const { id } = useParams();

  const handleGmailSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      showToast("Gmail connected successfully!", "success");
      setApps((prevApps) =>
        prevApps.map((app) =>
          app.type === "gmail"
            ? { ...app, signedIn: true, apiKey: JSON.stringify(tokenResponse) }
            : app
        )
      );
    },
    onError: () => {
      showToast("Gmail connection failed", "error");
    },
    scope:
      "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
  });

  const handleGoogleDocsSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      showToast("Google Docs connected successfully!", "success");
      setApps((prevApps) =>
        prevApps.map((app) =>
          app.type === "googledocs"
            ? { ...app, signedIn: true, apiKey: JSON.stringify(tokenResponse) }
            : app
        )
      );
    },
    onError: () => {
      showToast("Google Docs connection failed", "error");
    },
    scope:
      "https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/documents",
  });

  const handleGoogleSheetsSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      showToast("Google Sheets connected successfully!", "success");
      setApps((prevApps) =>
        prevApps.map((app) =>
          app.type === "googlesheet"
            ? { ...app, signedIn: true, apiKey: JSON.stringify(tokenResponse) }
            : app
        )
      );
    },
    onError: () => {
      showToast("Google Sheets connection failed", "error");
    },
    scope:
      "https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/spreadsheets",
  });

  const handleGoogleMeetSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      showToast("Google Meet connected successfully!", "success");
      setApps((prevApps) =>
        prevApps.map((app) =>
          app.type === "googlemeet"
            ? { ...app, signedIn: true, apiKey: JSON.stringify(tokenResponse) }
            : app
        )
      );
    },
    onError: () => {
      showToast("Google Meet connection failed", "error");
    },
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
  });

  const handleGoogleDriveSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      showToast("Google Drive connected successfully!", "success");
      setApps((prevApps) =>
        prevApps.map((app) =>
          app.type === "googledrive"
            ? { ...app, signedIn: true, apiKey: JSON.stringify(tokenResponse) }
            : app
        )
      );
    },
    onError: () => {
      showToast("Google Drive connection failed", "error");
    },
    scope:
      "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file",
  });

  const handleNotionSignIn = () => {
    const clientId = process.env.REACT_APP_NOTION_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_NOTION_REDIRECT_URI;

    // Notion OAuth2 authorization URL
    const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&owner=user`;

    // Open Notion authorization in a new window
    const authWindow = window.open(authUrl, "_blank", "width=500,height=600");

    // Listen for the OAuth callback
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "NOTION_AUTH_SUCCESS") {
        try {
          const { code } = event.data;
          // You'll need to exchange this code for an access token in your backend
          const { data } = await backendAxios.post("/auth/notion-login", {
            code,
          });
          showToast("Notion connected successfully!", "success");
          setApps((prevApps) =>
            prevApps.map((app) =>
              app.type === "notion"
                ? {
                    ...app,
                    signedIn: true,
                    apiKey: JSON.stringify(data),
                  }
                : app
            )
          );
        } catch (error) {
          showToast("Notion connection failed", "error");
        }
        authWindow.close();
      }
    });
  };

  const handleTwitterSignIn = async () => {
    // Generate PKCE values
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store code verifier in session storage for the callback
    sessionStorage.setItem("twitter_code_verifier", codeVerifier);

    // Twitter OAuth parameters
    const clientId = process.env.REACT_APP_TWITTER_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_TWITTER_REDIRECT_URI;
    const scope = "tweet.read tweet.write users.read offline.access";

    // Construct Twitter authorization URL
    const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("code_challenge", codeChallenge);
    authUrl.searchParams.append("code_challenge_method", "S256");
    authUrl.searchParams.append("state", crypto.randomUUID());

    // Open Twitter authorization in a popup
    const authWindow = window.open(
      authUrl.toString(),
      "twitter-auth",
      "width=500,height=700"
    );

    // Listen for the OAuth callback
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "TWITTER_AUTH_SUCCESS") {
        try {
          const { code } = event.data;
          const codeVerifier = sessionStorage.getItem("twitter_code_verifier");

          // Exchange code for token
          const { data } = await backendAxios.post("/auth/twitter-login", {
            code,
            codeVerifier,
          });

          showToast("Twitter connected successfully!", "success");
          setApps((prevApps) =>
            prevApps.map((app) =>
              app.type === "twitter"
                ? {
                    ...app,
                    signedIn: true,
                    apiKey: JSON.stringify(data),
                  }
                : app
            )
          );
          sessionStorage.removeItem("twitter_code_verifier");
        } catch (error) {
          showToast("Twitter connection failed", "error");
        }
        authWindow.close();
      }
    });
  };

  const handleInstagramSignIn = () => {
    const clientId = process.env.REACT_APP_INSTAGRAM_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_INSTAGRAM_REDIRECT_URI;
    const scope = "user_profile,user_media"; // Add more scopes as needed

    // Construct Instagram authorization URL
    const authUrl = new URL("https://api.instagram.com/oauth/authorize");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("state", crypto.randomUUID());

    // Open Instagram authorization in a popup
    const authWindow = window.open(
      authUrl.toString(),
      "instagram-auth",
      "width=500,height=700"
    );

    // Listen for the OAuth callback
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "INSTAGRAM_AUTH_SUCCESS") {
        try {
          const { code } = event.data;

          // Exchange code for token
          const { data } = await backendAxios.post("/auth/instagram-login", {
            code,
          });

          showToast("Instagram connected successfully!", "success");
          setApps((prevApps) =>
            prevApps.map((app) =>
              app.type === "instagram"
                ? {
                    ...app,
                    signedIn: true,
                    apiKey: JSON.stringify(data),
                  }
                : app
            )
          );
        } catch (error) {
          showToast("Instagram connection failed", "error");
        }
        authWindow.close();
      }
    });
  };

  const handleLinkedinSignIn = () => {
    const clientId = process.env.REACT_APP_LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_LINKEDIN_REDIRECT_URI;
    const scope = "r_liteprofile r_emailaddress w_member_social"; // Add more scopes as needed
    const state = crypto.randomUUID();

    // Store state in session storage for verification
    sessionStorage.setItem("linkedin_state", state);

    // Construct LinkedIn authorization URL
    const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("state", state);

    // Open LinkedIn authorization in a popup
    const authWindow = window.open(
      authUrl.toString(),
      "linkedin-auth",
      "width=500,height=700"
    );

    // Listen for the OAuth callback
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "LINKEDIN_AUTH_SUCCESS") {
        try {
          const { code, state: returnedState } = event.data;

          // Verify state to prevent CSRF attacks
          const savedState = sessionStorage.getItem("linkedin_state");
          if (returnedState !== savedState) {
            throw new Error("State mismatch - possible CSRF attack");
          }

          // Exchange code for token
          const { data } = await backendAxios.post("/auth/linkedin-login", {
            code,
          });

          showToast("Linkedin connected successfully!", "success");
          setApps((prevApps) =>
            prevApps.map((app) =>
              app.type === "linkedin"
                ? {
                    ...app,
                    signedIn: true,
                    apiKey: JSON.stringify(data),
                  }
                : app
            )
          );
          sessionStorage.removeItem("linkedin_state");
        } catch (error) {
          showToast("Linkedin connection failed", "error");
        }
        authWindow.close();
      }
    });
  };

  const handleCalendlySignIn = () => {
    const clientId = process.env.REACT_APP_CALENDLY_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_CALENDLY_REDIRECT_URI;
    const state = crypto.randomUUID();

    // Store state in session storage for verification
    sessionStorage.setItem("calendly_state", state);

    // Construct Calendly authorization URL
    const authUrl = new URL("https://auth.calendly.com/oauth/authorize");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("state", state);

    // Open Calendly authorization in a popup
    const authWindow = window.open(
      authUrl.toString(),
      "calendly-auth",
      "width=500,height=700"
    );

    // Listen for the OAuth callback
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;

      console.log(window.last, event.data.uid);

      if (
        event.data.type === "CALENDLY_AUTH_SUCCESS" &&
        window.last !== event.data.uid
      ) {
        try {
          const { code, state: returnedState } = event.data;

          // Verify state to prevent CSRF attacks
          const savedState = sessionStorage.getItem("calendly_state");
          if (returnedState !== savedState) {
            throw new Error("State mismatch - possible CSRF attack");
          }

          // Exchange code for token
          const { data } = await backendAxios.post("/auth/calendly-login", {
            code,
            workspaceId: id,
          });

          showToast("Calendly connected successfully!", "success");
          setApps((prevApps) =>
            // prevApps.map((app) =>
            //   app.type === "calendly"
            //     ? {
            //         ...app,
            //         signedIn: true,
            //         apiKey: JSON.stringify(data),
            //       }
            //     : app
            // )
            {
              const nextApps = prevApps.map((item) =>
                item.type === "calendly"
                  ? {
                      ...item,
                      signedIn: true,
                      apiKey: JSON.stringify(data),
                    }
                  : item
              );
              return nextApps;
            }
          );
          sessionStorage.removeItem("calendly_state");
        } catch (error) {
          showToast("Calendly connection failed", "error");
        }
        authWindow.close();
        window.removeEventListener("message", this);
      }
    });
  };

  const handleTikTokSignIn = () => {
    const clientId = process.env.REACT_APP_TIKTOK_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_TIKTOK_REDIRECT_URI;
    const scope = "user.info.basic,video.list,video.upload"; // Add more scopes as needed
    const state = crypto.randomUUID();

    // Store state in session storage for verification
    sessionStorage.setItem("tiktok_state", state);

    // Construct TikTok authorization URL
    const authUrl = new URL("https://www.tiktok.com/auth/authorize/");
    authUrl.searchParams.append("client_key", clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("state", state);

    // Open TikTok authorization in a popup
    const authWindow = window.open(
      authUrl.toString(),
      "tiktok-auth",
      "width=500,height=700"
    );

    // Listen for the OAuth callback
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "TIKTOK_AUTH_SUCCESS") {
        try {
          const { code, state: returnedState } = event.data;

          // Verify state to prevent CSRF attacks
          const savedState = sessionStorage.getItem("tiktok_state");
          if (returnedState !== savedState) {
            throw new Error("State mismatch - possible CSRF attack");
          }

          // Exchange code for token
          const { data } = await backendAxios.post("/auth/tiktok-login", {
            code,
          });

          showToast("TikTok connected successfully!", "success");
          setApps((prevApps) =>
            prevApps.map((app) =>
              app.type === "tiktok"
                ? { ...app, signedIn: true, apiKey: JSON.stringify(data) }
                : app
            )
          );
          sessionStorage.removeItem("tiktok_state");
        } catch (error) {
          showToast("TikTok connection failed", "error");
        }
        authWindow.close();
      }
    });
  };

  const handleMicrosoftTeamsSignIn = () => {
    const clientId = process.env.REACT_APP_MICROSOFT_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_MICROSOFT_REDIRECT_URI;
    const tenantId = process.env.REACT_APP_MICROSOFT_TENANT_ID; // 'common' for multi-tenant apps
    const state = crypto.randomUUID();

    // Define required Microsoft Graph API permissions
    const scope = encodeURIComponent(
      [
        "User.Read",
        "Team.ReadBasic.All",
        "Channel.ReadBasic.All",
        "ChannelMessage.Read.All",
        "ChannelMessage.Send",
        "offline_access",
      ].join(" ")
    );

    // Store state in session storage for verification
    sessionStorage.setItem("msteams_state", state);

    // Construct Microsoft authorization URL
    const authUrl = new URL(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`
    );
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("response_mode", "fragment");

    // Open Microsoft authorization in a popup
    const authWindow = window.open(
      authUrl.toString(),
      "microsoft-auth",
      "width=500,height=700"
    );

    // Listen for the OAuth callback
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "MICROSOFT_TEAMS_AUTH_SUCCESS") {
        try {
          const { code, state: returnedState } = event.data;

          // Verify state to prevent CSRF attacks
          const savedState = sessionStorage.getItem("msteams_state");
          if (returnedState !== savedState) {
            throw new Error("State mismatch - possible CSRF attack");
          }

          // Exchange code for token
          const { data } = await backendAxios.post(
            "/auth/microsoft-teams-login",
            {
              code,
            }
          );

          showToast("Microsoft Teams connected successfully!", "success");
          setApps((prevApps) =>
            prevApps.map((app) =>
              app.type === "microsoftteams"
                ? { ...app, signedIn: true, apiKey: JSON.stringify(data) }
                : app
            )
          );
          sessionStorage.removeItem("msteams_state");
        } catch (error) {
          showToast("Microsoft Teams connection failed", "error");
        }
        authWindow.close();
      }
    });
  };

  const handleMicrosoftWordSignIn = () => {
    const clientId = process.env.REACT_APP_MICROSOFT_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_MICROSOFT_REDIRECT_URI;
    const tenantId = process.env.REACT_APP_MICROSOFT_TENANT_ID; // 'common' for multi-tenant apps
    const state = crypto.randomUUID();

    // Define required Microsoft Graph API permissions for Word
    const scope = encodeURIComponent(
      [
        "User.Read",
        "Files.ReadWrite",
        "Files.ReadWrite.All",
        "Sites.ReadWrite.All",
        "offline_access",
      ].join(" ")
    );

    // Store state in session storage for verification
    sessionStorage.setItem("msword_state", state);

    // Construct Microsoft authorization URL
    const authUrl = new URL(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`
    );
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("response_mode", "fragment");

    // Open Microsoft authorization in a popup
    const authWindow = window.open(
      authUrl.toString(),
      "microsoft-word-auth",
      "width=500,height=700"
    );

    // Listen for the OAuth callback
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "MICROSOFT_WORD_AUTH_SUCCESS") {
        try {
          const { code, state: returnedState } = event.data;

          // Verify state to prevent CSRF attacks
          const savedState = sessionStorage.getItem("msword_state");
          if (returnedState !== savedState) {
            throw new Error("State mismatch - possible CSRF attack");
          }

          // Exchange code for token
          const { data } = await backendAxios.post(
            "/auth/microsoft-word-login",
            {
              code,
            }
          );

          showToast("Microsoft Word connected successfully!", "success");
          setApps((prevApps) =>
            prevApps.map((app) =>
              app.type === "microsoftword"
                ? { ...app, signedIn: true, apiKey: JSON.stringify(data) }
                : app
            )
          );
          sessionStorage.removeItem("msword_state");
        } catch (error) {
          showToast("Microsoft Word connection failed", "error");
        }
        authWindow.close();
      }
    });
  };

  const handleOutlookSignIn = () => {
    const clientId = process.env.REACT_APP_MICROSOFT_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_MICROSOFT_REDIRECT_URI;
    const tenantId = process.env.REACT_APP_MICROSOFT_TENANT_ID; // 'common' for multi-tenant apps
    const state = crypto.randomUUID();

    // Define required Microsoft Graph API permissions for Outlook
    const scope = encodeURIComponent(
      [
        "User.Read",
        "Mail.Read",
        "Mail.Send",
        "Mail.ReadWrite",
        "Calendars.ReadWrite",
        "Contacts.Read",
        "offline_access",
      ].join(" ")
    );

    // Store state in session storage for verification
    sessionStorage.setItem("outlook_state", state);

    // Construct Microsoft authorization URL
    const authUrl = new URL(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`
    );
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("response_mode", "fragment");

    // Open Microsoft authorization in a popup
    const authWindow = window.open(
      authUrl.toString(),
      "outlook-auth",
      "width=500,height=700"
    );

    // Listen for the OAuth callback
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "OUTLOOK_AUTH_SUCCESS") {
        try {
          const { code, state: returnedState } = event.data;

          // Verify state to prevent CSRF attacks
          const savedState = sessionStorage.getItem("outlook_state");
          if (returnedState !== savedState) {
            throw new Error("State mismatch - possible CSRF attack");
          }

          // Exchange code for token
          const { data } = await backendAxios.post("/auth/outlook-login", {
            code,
          });

          showToast("Outlook connected successfully!", "success");
          setApps((prevApps) =>
            prevApps.map((app) =>
              app.type === "outlook"
                ? { ...app, signedIn: true, apiKey: JSON.stringify(data) }
                : app
            )
          );
          sessionStorage.removeItem("outlook_state");
        } catch (error) {
          showToast("Outlook connection failed", "error");
        }
        authWindow.close();
      }
    });
  };

  const handleSlackSignIn = () => {
    const clientId = process.env.REACT_APP_SLACK_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_SLACK_REDIRECT_URI;
    const state = crypto.randomUUID();

    // Define required Slack scopes
    const scope = ["openid", "channels:read"].join(",");

    // Store state in session storage for verification
    sessionStorage.setItem("slack_state", state);

    // Construct Slack authorization URL
    const authUrl = new URL("https://slack.com/oauth/v2/authorize");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("state", state);

    // Open Slack authorization in a popup
    const authWindow = window.open(
      authUrl.toString(),
      "slack-auth",
      "width=500,height=700"
    );

    // Listen for the OAuth callback
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "SLACK_AUTH_SUCCESS") {
        try {
          const { code, state: returnedState } = event.data;

          // Verify state to prevent CSRF attacks
          const savedState = sessionStorage.getItem("slack_state");
          if (returnedState !== savedState) {
            throw new Error("State mismatch - possible CSRF attack");
          }

          // Exchange code for token
          const { data } = await backendAxios.post("/auth/slack-login", {
            code,
          });

          showToast("Slack connected successfully!", "success");
          setApps((prevApps) =>
            prevApps.map((app) =>
              app.type === "slack"
                ? { ...app, signedIn: true, apiKey: JSON.stringify(data) }
                : app
            )
          );
          sessionStorage.removeItem("slack_state");
        } catch (error) {
          showToast("Slack connection failed", "error");
        }
        authWindow.close();
      }
    });
  };

  const handleCalcomSignIn = () => {
    const clientId = process.env.REACT_APP_CALCOM_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_CALCOM_REDIRECT_URI;
    const state = crypto.randomUUID();

    // Define required Cal.com scopes
    const scope = [
      "calendar:read",
      "calendar:write",
      "availability:read",
      "availability:write",
      "bookings:read",
      "bookings:write",
      "webhook:write",
      "webhook:read",
    ].join(" ");

    // Store state in session storage for verification
    sessionStorage.setItem("calcom_state", state);

    // Construct Cal.com authorization URL
    const authUrl = new URL("https://api.cal.com/oauth/authorize");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("state", state);

    // Open Cal.com authorization in a popup
    const authWindow = window.open(
      authUrl.toString(),
      "calcom-auth",
      "width=500,height=700"
    );

    // Listen for the OAuth callback
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "CALCOM_AUTH_SUCCESS") {
        try {
          const { code, state: returnedState } = event.data;

          // Verify state to prevent CSRF attacks
          const savedState = sessionStorage.getItem("calcom_state");
          if (returnedState !== savedState) {
            throw new Error("State mismatch - possible CSRF attack");
          }

          // Exchange code for token
          const { data } = await backendAxios.post("/auth/calcom-login", {
            code,
          });

          showToast("Cal.com connected successfully!", "success");
          setApps((prevApps) =>
            prevApps.map((app) =>
              app.type === "cal"
                ? { ...app, signedIn: true, apiKey: JSON.stringify(data) }
                : app
            )
          );
          sessionStorage.removeItem("calcom_state");
        } catch (error) {
          showToast("Cal.com connection failed", "error");
        }
        authWindow.close();
      }
    });
  };

  const handleStripeSignIn = () => {
    const clientId = process.env.REACT_APP_STRIPE_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_STRIPE_REDIRECT_URI;
    const state = crypto.randomUUID();

    // Store state in session storage for verification
    sessionStorage.setItem("stripe_state", state);

    // Construct Stripe authorization URL
    const authUrl = new URL("https://connect.stripe.com/oauth/authorize");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "read-write");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("state", state);

    // Optional parameters for pre-filling user information
    if (process.env.REACT_APP_STRIPE_SUGGESTED_CAPABILITIES) {
      authUrl.searchParams.append(
        "suggested_capabilities",
        process.env.REACT_APP_STRIPE_SUGGESTED_CAPABILITIES
      );
    }

    // Open Stripe authorization in a popup
    const authWindow = window.open(
      authUrl.toString(),
      "stripe-auth",
      "width=500,height=700"
    );

    // Listen for the OAuth callback
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "STRIPE_AUTH_SUCCESS") {
        try {
          const { code, state: returnedState } = event.data;

          // Verify state to prevent CSRF attacks
          const savedState = sessionStorage.getItem("stripe_state");
          if (returnedState !== savedState) {
            throw new Error("State mismatch - possible CSRF attack");
          }

          // Exchange code for token
          const { data } = await backendAxios.post("/auth/stripe-login", {
            code,
          });

          showToast("Stripe connected successfully!", "success");
          setApps((prevApps) =>
            prevApps.map((app) =>
              app.type === "stripe"
                ? { ...app, signedIn: true, apiKey: JSON.stringify(data) }
                : app
            )
          );
          sessionStorage.removeItem("stripe_state");
        } catch (error) {
          showToast("Stripe connection failed", "error");
        }
        authWindow.close();
      }
    });
  };

  const handleWhatsAppSignIn = () => {
    const clientId = process.env.REACT_APP_META_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_WHATSAPP_REDIRECT_URI;
    const state = crypto.randomUUID();

    // Define required Meta/WhatsApp scopes
    const scope = [
      "whatsapp_business_management",
      "whatsapp_business_messaging",
      "business_management",
    ].join(",");

    // Store state in session storage for verification
    sessionStorage.setItem("whatsapp_state", state);

    // Construct Meta authorization URL
    const authUrl = new URL("https://www.facebook.com/v17.0/dialog/oauth");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("scope", scope);
    authUrl.searchParams.append("response_type", "code");

    // Open Meta authorization in a popup
    const authWindow = window.open(
      authUrl.toString(),
      "whatsapp-auth",
      "width=500,height=700"
    );

    // Listen for the OAuth callback
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "WHATSAPP_AUTH_SUCCESS") {
        try {
          const { code, state: returnedState } = event.data;

          // Verify state to prevent CSRF attacks
          const savedState = sessionStorage.getItem("whatsapp_state");
          if (returnedState !== savedState) {
            throw new Error("State mismatch - possible CSRF attack");
          }

          // Exchange code for token
          const { data } = await backendAxios.post("/auth/whatsapp-login", {
            code,
          });

          showToast("Whatsapp connected successfully!", "success");
          setApps((prevApps) =>
            prevApps.map((app) =>
              app.type === "googledrive"
                ? { ...app, signedIn: true, apiKey: JSON.stringify(data) }
                : app
            )
          );
          sessionStorage.removeItem("whatsapp_state");
        } catch (error) {
          showToast("Whatsapp connection failed", "error");
        }
        authWindow.close();
      }
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }

    if (!id) {
      navigate("/dashboard");
      return;
    }

    (async () => {
      const { data } = await backendAxios.get(`/workspaces/${id}`);
      if (data) {
        setWorkspace(data);
        setApps((prevApps) =>
          prevApps.map((app) => {
            const same = data.apps.find((item) => item.app_type === app.type);
            if (same) {
              return {
                ...app,
                signedIn: same.status === "active",
                apiKey: same.app_key,
              };
            }
            return app;
          })
        );
      } else {
        showToast("Workspace not found", "error");
        navigate("/dashboard");
      }
    })();
  }, [navigate, id, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await backendAxios.post(`/workspaces/${id}`, {
        list: apps,
      });
      if (data) {
        showToast("Workspace updated successfully!", "success");
        navigate("/dashboard");
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Error updating workspace",
        "error"
      );
    }
  };

  const handleSignIn = async (appType) => {
    const countSignedInApps = () => {
      return apps.filter((app) => app.signedIn).length; // Count signed-in apps
    };
    if (countSignedInApps() >= workspace.plan.appsLimit) {
      showToast(
        "You have reached the maximum number of apps for your plan",
        "error"
      );
      return;
    }
    console.log(countSignedInApps());
    console.log(workspace.plan.appsLimit);
    // console.log(appType);

    if (apps.find((app) => app.type === appType).signedIn) {
      setApps((prevApps) =>
        prevApps.map((app) =>
          app.type === appType ? { ...app, signedIn: false } : app
        )
      );
    }

    switch (appType) {
      case "gmail":
        handleGmailSignIn();
        break;
      case "googledocs":
        handleGoogleDocsSignIn();
        break;
      case "googlesheet":
        handleGoogleSheetsSignIn();
        break;
      case "googlemeet":
        handleGoogleMeetSignIn();
        break;
      case "googledrive":
        handleGoogleDriveSignIn();
        break;
      case "notion":
        handleNotionSignIn();
        break;
      case "twitter":
        handleTwitterSignIn();
        break;
      case "instagram":
        handleInstagramSignIn();
        break;
      case "linkedin":
        handleLinkedinSignIn();
        break;
      case "calendly":
        handleCalendlySignIn();
        break;
      case "tiktok":
        handleTikTokSignIn();
        break;
      case "microsoftteams":
        handleMicrosoftTeamsSignIn();
        break;
      case "microsoftword":
        handleMicrosoftWordSignIn();
        break;
      case "outlook":
        handleOutlookSignIn();
        break;
      case "slack":
        handleSlackSignIn();
        break;
      case "cal":
        handleCalcomSignIn();
        break;
      case "stripe":
        handleStripeSignIn();
        break;
      case "whatsapp":
        handleWhatsAppSignIn();
        break;
      default:
        break;
    }
  };

  const [apps, setApps] = useState([
    {
      name: "Notion",
      icon: "/assets/icons/apps/notion.png",
      signedIn: false,
      type: "notion",
      apiKey: "",
    },
    {
      name: "Twitter/X",
      icon: "/assets/icons/apps/twitter.png",
      signedIn: false,
      type: "twitter",
      apiKey: "",
    },
    {
      name: "Instagram",
      icon: "/assets/icons/apps/instagram.png",
      signedIn: false,
      type: "instagram",
      apiKey: "",
    },
    {
      name: "LinkedIn",
      icon: "/assets/icons/apps/linkedin.png",
      signedIn: false,
      type: "linkedin",
      apiKey: "",
    },
    {
      name: "Gmail app",
      icon: "/assets/icons/apps/gmail.png",
      signedIn: false,
      type: "gmail",
      apiKey: "",
    },
    {
      name: "Google drive",
      icon: "/assets/icons/apps/googledrive.png",
      signedIn: false,
      type: "googledrive",
      apiKey: "",
    },
    {
      name: "Calendly",
      icon: "/assets/icons/apps/calendly.png",
      signedIn: false,
      type: "calendly",
      apiKey: "",
    },
    {
      name: "TikTok",
      icon: "/assets/icons/apps/tiktok.png",
      signedIn: false,
      type: "tiktok",
      apiKey: "",
    },
    {
      name: "Google docs",
      icon: "/assets/icons/apps/googledocs.png",
      signedIn: false,
      type: "googledocs",
      apiKey: "",
    },
    {
      name: "Google sheets",
      icon: "/assets/icons/apps/googlesheet.png",
      signedIn: false,
      type: "googlesheet",
      apiKey: "",
    },
    {
      name: "Microsoft teams",
      icon: "/assets/icons/apps/microsoftteams.png",
      signedIn: false,
      type: "microsoftteams",
      apiKey: "",
    },
    {
      name: "Microsoft word",
      icon: "/assets/icons/apps/word.png",
      signedIn: false,
      type: "microsoftword",
      apiKey: "",
    },
    {
      name: "Outlook",
      icon: "/assets/icons/apps/outlook.png",
      signedIn: false,
      type: "outlook",
      apiKey: "",
    },
    {
      name: "Slack",
      icon: "/assets/icons/apps/slack.png",
      signedIn: false,
      type: "slack",
      apiKey: "",
    },
    {
      name: "Cal.com",
      icon: "/assets/icons/apps/cal.png",
      signedIn: false,
      type: "cal",
      apiKey: "",
    },
    {
      name: "Google meet",
      icon: "/assets/icons/apps/googlemeet.png",
      signedIn: false,
      type: "googlemeet",
      apiKey: "",
    },
    {
      name: "Stripe",
      icon: "/assets/icons/apps/stripe.png",
      signedIn: false,
      type: "stripe",
      apiKey: "",
    },
    {
      name: "Whatsapp",
      icon: "/assets/icons/apps/whatsapp.png",
      signedIn: false,
      type: "whatsapp",
      apiKey: "",
    },
  ]);

  useEffect(() => {
    // if (workspace?.apps) {
    //     setApps(prevApps => prevApps.map(app => ({
    //         ...app,
    //         signedIn: workspace.apps.some(wsApp => wsApp.app_type === app.type),
    //         disabled: workspace.apps.some(wsApp => wsApp.app_type === app.type)
    //     })));
    // }
  }, [workspace]);

  return (
    <div className="min-h-screen bg-white p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-black transition-colors mb-8"
        >
          <span className="mr-2">←</span> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{workspace?.name}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {apps.map((app, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 bg-gray-100 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src={app.icon}
                    alt={`${app.name} icon`}
                    className="w-10 h-6"
                  />
                  <span className="text-sm font-medium">{app.name}</span>
                </div>
                <button
                  className={`text-sm px-1 py-0 rounded-full transition-colors w-16 h-6
                    ${
                      app.signedIn
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  onClick={() => handleSignIn(app.type)}
                >
                  {app.signedIn ? "Sign out" : "Sign in"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full max-w-md mx-auto block py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default EditWorkspace;
