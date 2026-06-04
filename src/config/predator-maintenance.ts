export const predatorServiceNotices = {
  platform:
    "Predator maintenance runs on Nintendo (Switch). Your EA account is used by our operator while you're away.",
  nintendoAccount:
    "You need a Nintendo Account linked to Apex on Switch before we start. Create one first if you don't have it yet.",
  nintendoBackup:
    "A Nintendo backup login code lets our booster sign in without bugging you. Generate it before checkout and keep it private.",
  eaCredentials:
    "We also need your EA email, password, and EA backup code so the operator can log in securely.",
} as const;

export const nintendoAccountGuide = {
  title: "How to create a Nintendo Account",
  steps: [
    "On your Nintendo Switch, open the Nintendo eShop or System Settings → Users.",
    "Select your user profile, then Link Nintendo Account (or Create New Account).",
    "Follow the prompts at accounts.nintendo.com — use an email you can access.",
    "Complete email verification and set a strong password.",
    "In Apex Legends on Switch, ensure your EA account is linked to this Nintendo profile (EA login inside the game).",
    "Test that you can launch Apex online before submitting this form.",
  ],
  link: {
    label: "Nintendo account help (official)",
    href: "https://www.nintendo.com/au/support/articles/how-to-create-a-nintendo-account/",
  },
} as const;

export const nintendoBackupCodeGuide = {
  title: "Nintendo backup login code",
  steps: [
    "On a browser, sign in at accounts.nintendo.com with your Nintendo Account.",
    "Open Sign-in and security settings → Backup login codes (or Login settings).",
    "Generate a new backup login code and copy it immediately — it is shown only once.",
    "Paste that code in the form below. Our operator uses it once to sign in on Switch.",
    "You can revoke or regenerate codes later from the same page after service ends.",
  ],
} as const;

export const eaBackupCodeGuide = {
  title: "How to get your EA backup code",
  steps: [
    "Go to myaccount.ea.com and sign in with the same EA email you use for Apex.",
    "Open Security settings → Login verification or Backup codes.",
    "Enable login verification if prompted, then view or generate backup codes.",
    "Copy one unused backup code into the form below (operators need it if a new device login is required).",
    "If you use an authenticator app, you may need to generate an app-specific backup code per EA’s prompts.",
  ],
  link: {
    label: "EA account security (official)",
    href: "https://help.ea.com/en/help/account/ealogin-verification-information/",
  },
} as const;
