# Vela — Component Map

## Reusable CSS Classes (from style.css)

| Class           | Description                                      |
|-----------------|--------------------------------------------------|
| .glass          | Frosted-glass card (backdrop-blur + surface bg)  |
| .card           | Elevated card with border + rounded corners      |
| .btn            | Base button (use with modifier below)            |
| .btn-primary    | Gradient CTA button with glow shadow             |
| .btn-secondary  | Soft translucent button                          |
| .btn-ghost      | Outlined ghost button                            |
| .btn-danger     | Red-tinted destructive action button             |
| .btn-sm         | Compact button variant                           |
| .chip           | Inline status badge                              |
| .chip.success   | Green success badge                              |
| .chip.pending   | Amber pending badge                              |
| .chip.failed    | Red failed badge                                 |
| .avatar         | Gradient 2-letter avatar square                  |
| .input-wrap     | Icon + input field container                     |
| .list-item      | Icon + meta + end row (for lists)                |
| .grid-4         | 4-column icon grid                               |
| .grid-icon-item | Tappable icon + label grid cell                  |
| .switch         | Toggle switch (add .on for active state)         |
| .pin-dots       | 4-dot PIN indicator                              |
| .otp-row        | 4 OTP digit inputs in a row                      |
| .progress-bar   | Track + .fill progress indicator                 |
| .dots-indicator | Onboarding pagination dots                       |
| .bottom-sheet-overlay | Full-screen dimmed sheet overlay          |
| .bottom-sheet   | Slide-up modal sheet                             |
| .toast          | Temporary notification banner                    |
| .grad-text      | Transparent gradient text fill                   |

## Screen IDs (JS navigation targets)

splash, onboard-1/2/3, login, signup, forgot-password,
otp, create-pin, biometric-setup, biometric-login,
home, notifications, send-money, send-amount, send-pin, send-success,
receive, scan-qr, request-money, cash-deposit-withdraw,
bills-hub, bill-pay, cards-hub, card-details, add-bank-account,
finance-hub, savings-detail, loan-request,
security-settings, login-history, settings, edit-profile, kyc-verification,
transactions, transaction-details, rewards, live-chat

## JS API (script.js)

go(screenId)          → navigate to screen
back()                → go back in history
toast(message)        → show temporary toast notification
openSheet(id)         → show bottom sheet overlay
closeSheet(id)        → hide bottom sheet overlay
toggleBalance()       → show/hide wallet balance
setSendTab(tab)       → switch send-money tab (bank/wallet)
openBill(label,icon)  → navigate to bill-pay screen for a category
toggleFreeze()        → freeze/unfreeze card visual
