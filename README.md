# College Checklist Website 🎓

A beautiful, responsive website to help you organize and track all the items you need to bring to college. Built with HTML, CSS, and JavaScript.

## Features ✨

- **Organized Categories**: All your college essentials organized into logical categories
- **Interactive Checklist**: Check off items as you pack them
- **Smart Sorting**: Completed items automatically move to the top of each section
- **Add/Edit/Delete**: Easily add new items, edit existing ones, or remove what you don't need
- **Google Sign-In**: Sync your checklist across devices using your Google account
- **Progress Tracking**: Visual progress bar showing how much you've packed
- **Export/Import**: Save your checklist as a file or load from a previous export
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern gradient design with smooth animations

## Categories 📋

- 🛏️ **Bedding** - Pillows, sheets, blankets
- 👕 **Clothing** - Everyday wear, cold weather gear, formal outfits
- 💻 **Electronics** - Laptops, chargers, monitors, accessories
- 🧺 **Room Essentials** - Humidifier, mini fridge, tools
- 🧼 **Bathroom & Hygiene** - Towels, toiletries, personal care
- 📚 **Study Supplies** - Notebooks, pens, backpack
- 💳 **Documents & ID** - Student ID, passport, insurance cards
- 🌧️ **Weather & Comfort** - Umbrella, seasonal items
- 🍽️ **Kitchen & Cleaning** - Dish soap, cleaning supplies

## Setup Instructions 🚀

### 1. Basic Setup (No Google Sign-In)
1. Download all files to a folder
2. Open `index.html` in your web browser
3. Start using the checklist immediately!

### 2. Google Sign-In Setup (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an "OAuth 2.0 Client ID"
5. Set the authorized JavaScript origins to include your domain (or `http://localhost` for testing)
6. Copy your Client ID
7. Open `index.html` and replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID
8. Save and refresh the page

## How to Use 📖

### Adding Items
1. Select a category from the dropdown
2. Type the item name
3. Click "Add Item"

### Managing Items
- **Check off**: Click the checkbox to mark as packed
- **Edit**: Hover over an item and click the edit button (✏️)
- **Delete**: Hover over an item and click the delete button (🗑️)

### Google Sign-In
- Click "Sign in with Google" to sync your checklist
- Your data will be saved to your Google account
- Sign out to clear local data

### Export/Import
- **Export**: Click "Export Checklist" to save as a JSON file
- **Import**: Click "Import Checklist" to load from a previously exported file

## File Structure 📁

```
college-checklist/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Browser Compatibility 🌐

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Customization 🎨

### Adding New Categories
1. Add the category to the HTML in the form dropdown
2. Create a new category section with the same structure
3. Update the JavaScript category list

### Changing Colors
Modify the CSS variables in `styles.css`:
- Primary gradient: `#667eea` to `#764ba2`
- Accent colors: `#ff4757` for delete buttons
- Background: Various shades of white and gray

### Adding Features
The JavaScript is modular and easy to extend. Add new functions to `script.js` and call them from the HTML.

## Troubleshooting 🔧

### Google Sign-In Not Working
- Check that your Client ID is correct
- Ensure the Google+ API is enabled
- Verify your authorized origins include your domain

### Items Not Saving
- Check that localStorage is enabled in your browser
- Try signing in with Google for cloud sync
- Export your checklist as a backup

### Styling Issues
- Clear your browser cache
- Check that all CSS files are loaded
- Verify the file paths are correct

## Contributing 🤝

Feel free to improve this checklist by:
- Adding new categories
- Improving the design
- Adding new features
- Fixing bugs
- Improving accessibility

## License 📄

This project is open source and available under the MIT License.

## Support 💬

If you have questions or need help:
1. Check this README first
2. Look for similar issues in the code
3. Try the troubleshooting section above

---

**Happy Packing! 🎒✨**

*Built with ❤️ for college students everywhere* 