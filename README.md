````markdown
# Next.js Project with Gmail API & Pub/Sub Integration

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It integrates **Gmail API** using **OAuth2** and subscribes to **Google Pub/Sub** push notifications.

---

## Getting Started

### Install Dependencies

Run the development server:

```bash
# Using npm (with legacy peer deps to avoid warnings)
npm install --legacy-peer-deps
npm run dev
# or
yarn
yarn dev
# or
pnpm install
pnpm dev
# or
bun install
bun dev
````

Open [http://localhost:3000](http://localhost:3000) in your browser. The page auto-updates as you edit `app/page.tsx`.

---

## Google Cloud Setup

Follow these steps to enable Gmail API and Pub/Sub for your project.

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** → **New Project**.
3. Enter a name for your project (e.g., `Short Listing Project`) and click **Create**.

---

### 2. Enable Gmail API

1. Inside your project, go to **APIs & Services → Library**.
2. Search for **Gmail API** and click **Enable**.


---

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. If prompted, configure the **OAuth consent screen** first:

   * **User Type:** External (or Internal if only for your organization)
   * **App Name, Logo, Email:** Fill as needed
   * **Authorized Domains:** Add your frontend domain
   * **Scopes:** Add Gmail scopes as required (`https://www.googleapis.com/auth/gmail.readonly`)
   * **Test Users:** Add emails that are allowed to access
3. After consent screen is configured, create the OAuth client:

   * **Application Type:** Web application
   * **Authorized Redirect URIs:** Add your redirect URL (e.g., `http://localhost:3000/api/auth/callback`)

You will get:

* **Client ID** → `GMAIL_CLIENT_ID`
* **Client Secret** → `GMAIL_CLIENT_SECRET`

---

### 4. Add Allowed Emails / Test Users

On the **OAuth consent screen**, add all test users under **Test Users**. These are the emails that can authenticate with your app.

---

## Google Cloud Pub/Sub Setup

### 1. Create a Topic

1. Go to **Pub/Sub → Topics → Create Topic**.
2. Enter a name (e.g., `gmail-watch`) and create it.


---

### 2. Add IAM Permissions

1. Go to **IAM & Admin → IAM**.
2. Click **Add**.
3. Add **allUsers** with these roles:

   * **Pub/Sub Publisher**
   * **Pub/Sub Subscriber**

---

### 3. Create a Subscription (Push Type)

1. Go to your Topic → **Create Subscription**.
2. Set **Delivery type** to **Push**.
3. Enter the **Endpoint URL** as your frontend URL (e.g., `https://your-app.com/api/gmail/push?token=PUBSUB_VERIFICATION_TOKEN`).
   - Make sure the `token` value matches the `PUBSUB_VERIFICATION_TOKEN` defined in your `.env` file.
4. Save the subscription.

---

## Running the App

1. Make sure your `.env` is configured with `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, and `PUBSUB_TOPIC_NAME`.
2. Start your development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) to verify your app.
4. Authenticate with Gmail and verify that Pub/Sub push notifications are received correctly.

---