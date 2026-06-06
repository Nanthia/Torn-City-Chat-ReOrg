A Tampermonkey userscript that enhances the Torn City chat system by allowing chat windows to be dragged, repositioned, and remembered between sessions without interfering with Torn's default behaviour.

Unlike scripts that permanently override the chat layout, Torn Chat Mover v6 keeps chats in their normal Torn-managed position until you choose to move them. Once moved, their location is saved and automatically restored whenever that chat is opened again.

⚠️ Work in Progress

This project is still under active development. Features and behaviour may change, and bugs are expected.

Features
✅ Non-destructive design
Chats behave exactly like normal Torn chat windows until moved.
No forced layout changes.
Existing Torn functionality remains intact.
✅ Drag and Drop

Every detected chat window receives a small draggable handle above it.

Click and drag the handle to reposition the chat.
The first drag automatically converts the chat from Torn-controlled positioning into fixed positioning.
Position updates in real time.
✅ Automatic Position Saving

Moved chats are automatically remembered.

When you reopen the same conversation later, it will return to the exact position where you left it.

Storage is handled locally using Tampermonkey's:

GM_setValue()
GM_getValue()

No external servers are used.

✅ Snap Buttons

Each handle includes quick alignment buttons:

◀ Snap to left side

▶ Snap to right side

Useful for quickly organising multiple conversations.

✅ Automatic Chat Detection

The script continuously watches Torn's chat system and automatically:

Detects newly opened chats
Adds drag handles
Removes handles when chats close
Cleans up observers automatically

No manual refresh required.

✅ React Protection

Torn occasionally re-renders chat components.

When a moved chat is reset by React, the script automatically restores its saved position without user intervention.

Installation
Requirements
Tampermonkey
Modern Chromium or Firefox browser
Torn account
Install
Install Tampermonkey.
Create a new userscript.
Replace the template with the script contents.
Save.
Visit:
https://www.torn.com/

The script will automatically activate.

How to Use
Normal behaviour

Open a chat.

It behaves exactly like Torn intended.

Moving a chat

Grab the small handle above the chat window and drag it.

The chat immediately becomes independently movable.

Its position will now be remembered.

Restoring

Next time that same chat opens:

Name is detected
Saved coordinates are loaded
Position is restored automatically
Snapping

Click:

◀ to align against the left edge
▶ to align against the right edge
How It Works

Each chat exists in one of two modes:

Mode	Behaviour
Natural	Torn controls positioning
Fixed	Script controls positioning

Chats remain in Natural Mode until the first drag.

This greatly reduces conflicts with Torn's own interface updates.

Current Capabilities
Detect multiple chat windows
Independent dragging
Persistent positions
Auto cleanup
Auto restore
Dynamic handles
Snap left/right buttons
Window resize handling
Automatic z-index management
React style recovery
Known Limitations

This project is still evolving.

Current limitations include:

Chat name detection relies on Torn's DOM structure and may require updates if Torn changes its interface.
Saved positions are linked to detected chat names.
Major Torn UI updates could temporarily break compatibility until the script is updated.
Planned Features

Potential future additions include:

Pin favourite chats
Grid snapping
Save custom layouts
Minimise/restore positions
Lock chat positions
Adjustable handle styling
Better mobile support
Settings menu
Export/import saved layouts
Privacy

This script:

✅ Stores data locally only
✅ Does not transmit information anywhere
✅ Does not access your Torn API
✅ Does not collect analytics
✅ Does not communicate with external servers

All saved positions remain within your browser's Tampermonkey storage.

Compatibility

Tested with:

Tampermonkey
Torn web client
Modern Chromium-based browsers
Firefox

Compatibility with future Torn UI updates is not guaranteed.

Disclaimer

This is an unofficial fan-made utility and is not affiliated with or endorsed by Torn City.

Use at your own risk. Changes to Torn's website may affect the script's functionality.

Contributing

Feedback, bug reports, and feature suggestions are welcome while the project is in development.

If you encounter an issue, include:

Browser version
Tampermonkey version
Description of the problem
Steps to reproduce
Console errors (if any)
License

You are free to modify and use this script for personal purposes.

If you redistribute modified versions, consider crediting the original project and clearly indicating your changes.
