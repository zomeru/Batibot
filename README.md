# Batibot

ChatGpt in your messenger app!

![Demo](https://raw.githubusercontent.com/zomeru/Batibot/main/assets/IMG-0019.GIF)

## 🛠 Set Up

1. Install and use the correct version of Node using [NVM](https://github.com/nvm-sh/nvm) (Node Version Manager)

   ```sh
   nvm install 16.9.1
   nvm use 16.9.1
   ```

2. Install [PNPM](https://pnpm.io/) (a Javascript package manager)

   - Using Homebrew
     ```sh
     brew install pnpm
     ```
   - Using npm
     ```sh
     npm install -g pnpm
     ```

3. Install dependencies

   ```sh
   pnpm install
   ```

4. Create a `.env` file

   > Generate an OPENAI API key -> https://platform.openai.com/account/api-keys
   > Create a Facebook Developer account, create an app and generate an access token -> https://developers.facebook.com/apps/?show_reminder=true
   > Create an account on Supabase and create a new project -> https://supabase.com/dashboard/projects

   ```
   PORT=8000
   PAGE_ACCESS_TOKEN=<GENERATED_FB_PAGE_ACCESS_TOKEN>
   PAGE_SENDING_ID=<YOUR_PAGE_SENDING_ID>
   VERIFY_TOKEN=<YOUR_CUSTOM_VERIFY_TOKEN> // can be a random string

   OPENAI_API_KEY=<OPENAI_API_KEY>

   SUPABASE_URL=<SUPABASE_PROJECT_URL>
   SUPABASE_API_KEY=<SUPABASE_SECRET_KEY>
   ```

5. Start the development server

   ```sh
   pnpm dev
   ```
