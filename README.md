# Torn Chat Mover v6

![Version](https://img.shields.io/badge/version-6.0.0-blue)
![Status](https://img.shields.io/badge/status-WIP-orange)
![License](https://img.shields.io/badge/license-MIT-green)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Compatible-yellow)

A non-destructive draggable chat manager for Torn City...


# Torn Chat Mover v6

A **Tampermonkey userscript** that enhances the **Torn City** chat system by allowing chat windows to be **dragged, repositioned, and remembered** between sessions without interfering with Torn's default behaviour.

Unlike scripts that permanently override the chat layout, **Torn Chat Mover v6 keeps chats in their normal Torn-managed position until you choose to move them.** Once moved, their location is saved and automatically restored whenever that chat is opened again.

> **⚠️ Work in Progress**
>
> This project is still under active development. Features and behaviour may change, and bugs are expected.

# 🚀 Quick Install

Click the link below to install directly into Tampermonkey:

👉 **Install Script (Raw GitHub)**  
https://raw.githubusercontent.com/Nanthia/Torn-City-Chat-ReOrg/main/TornChatMover.user.js

> If Tampermonkey is installed, this will open an install prompt automatically.

---

# Features

## ✅ Non-destructive Design

- Chats behave exactly like normal Torn chat windows until moved.
- No forced layout changes.
- Existing Torn functionality remains intact.

---

## ✅ Drag & Drop

Every detected chat window receives a small draggable handle above it.

- Click and drag the handle to reposition the chat.
- The first drag automatically converts the chat from Torn-controlled positioning into fixed positioning.
- Position updates in real time.

---

## ✅ Automatic Position Saving

Moved chats are automatically remembered.

When you reopen the same conversation later, it will return to the exact position where you left it.

Storage is handled locally using Tampermonkey's built-in functions:

- `GM_setValue()`
- `GM_getValue()`

No external servers are used.

---

## ✅ Snap Buttons

Each handle includes quick alignment buttons:

- ◀ Snap to Left
- ▶ Snap to Right

Useful for quickly organising multiple conversations.

---

## ✅ Automatic Chat Detection

The script continuously watches Torn's chat system and automatically:

- Detects newly opened chats
- Adds drag handles
- Removes handles when chats close
- Cleans up observers automatically

No manual refresh required.

---

## ✅ React Protection

Torn occasionally re-renders chat components.

When a moved chat is reset by React, the script automatically restores its saved position without user intervention.

---

# Installation

## Requirements

- Tampermonkey
- Modern Chromium-based browser or Firefox
- Torn account

## Installation

1. Install **Tampermonkey**.
2. Create a new userscript.
3. Replace the default template with this script.
4. Save the script.
5. Visit:

https://www.torn.com/

The script will activate automatically.

---

# Usage

## Default Behaviour

Open a chat window.

It behaves exactly as Torn intended.

---

## Moving a Chat

Grab the small handle above the chat window and drag it.

The chat immediately becomes independently movable.

Its position will now be remembered for future sessions.

---

## Automatic Restoration

The next time that chat opens:

- The chat name is detected
- Saved coordinates are loaded
- The window is restored to its previous location automatically

---

## Quick Snap Buttons

Use the handle controls to instantly align a chat window:

- ◀ Snap to the left side of the screen
- ▶ Snap to the right side of the screen

---

# How It Works

Each chat exists in one of two modes.

| Mode | Description |
|------------|---------------------------------------------|
| **Natural** | Torn controls the chat position |
| **Fixed** | Torn Chat Mover controls the chat position |

Chats remain in **Natural Mode** until the first time you drag them.

This greatly reduces conflicts with Torn's own interface updates while preserving the native experience.

---

# Current Features

- ✔ Automatic chat detection
- ✔ Independent dragging
- ✔ Persistent saved positions
- ✔ Automatic cleanup
- ✔ Automatic restoration
- ✔ Dynamic drag handles
- ✔ Snap left/right buttons
- ✔ Window resize handling
- ✔ Automatic z-index management
- ✔ React style recovery

---

# Known Limitations

This project is still evolving.

Current limitations include:

- Chat name detection relies on Torn's DOM structure and may require updates if Torn changes its interface.
- Saved positions are associated with detected chat names.
- Major Torn UI updates may temporarily break compatibility until the script is updated.

---

# Planned Features

Potential future additions include:

- 📌 Pin favourite chats
- 🧲 Grid snapping
- 💾 Save custom layouts
- 📂 Layout profiles
- 🔒 Lock chat positions
- 🎨 Customisable handle styling
- 📱 Better mobile support
- ⚙️ Settings menu
- 📤 Export/Import saved layouts

---

# Privacy

This script:

- ✅ Stores data locally only
- ✅ Does not transmit information anywhere
- ✅ Does not access your Torn API key
- ✅ Does not collect analytics
- ✅ Does not communicate with external servers

All saved positions remain within your browser's Tampermonkey storage.

---

# Compatibility

Tested with:

- Tampermonkey
- Torn web client
- Chromium-based browsers
- Mozilla Firefox

Compatibility with future Torn updates cannot be guaranteed.

---

# Disclaimer

This is an unofficial fan-made utility and is **not affiliated with or endorsed by Torn City**.

Use at your own risk. Changes to Torn's website may affect the script's functionality.

---

# Contributing

Feedback, bug reports, and feature suggestions are always welcome while the project is in development.

When reporting an issue, please include:

- Browser version
- Tampermonkey version
- Description of the problem
- Steps to reproduce
- Console errors (if available)

---

# License

Feel free to modify and use this script for personal use.

If you redistribute modified versions, please consider crediting the original project and clearly indicating your changes.

---

Made with ❤️ for the Torn community.
