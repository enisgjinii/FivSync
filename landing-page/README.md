# Fiverr Conversation Extractor Landing Page

A modern, responsive landing page for the Fiverr Conversation Extractor Chrome extension.

## Features

- 🎨 Modern, responsive design
- 📱 Mobile-friendly layout
- ⚡ Fast loading with optimized assets
- 🎯 Clear call-to-action sections
- 💰 Pricing comparison
- 🔒 Privacy-focused messaging

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript** - Interactive elements and smooth scrolling
- **Vercel** - Hosting and deployment

## Sections

1. **Hero Section** - Main value proposition with mockup
2. **Features** - Key benefits and capabilities
3. **Pricing** - Free vs Pro comparison
4. **CTA** - Call to action
5. **Footer** - Links and information

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd landing-page
   vercel
   ```

3. **Or connect to GitHub:**
   - Push to GitHub
   - Connect repository to Vercel
   - Auto-deploy on push

### Manual Deployment

1. **Build and deploy:**
   ```bash
   vercel --prod
   ```

2. **Custom domain (optional):**
   ```bash
   vercel domains add yourdomain.com
   ```

## Customization

### Colors
Update CSS variables in `styles.css`:
```css
:root {
    --primary: #3b82f6;
    --primary-dark: #2563eb;
    /* ... other colors */
}
```

### Content
Edit `index.html` to update:
- Hero text and messaging
- Feature descriptions
- Pricing information
- Contact details

### Styling
Modify `styles.css` for:
- Layout changes
- Color schemes
- Typography
- Responsive breakpoints

## Performance

- Optimized images and assets
- Minimal JavaScript
- CSS Grid for layout
- Intersection Observer for animations
- Lazy loading ready

## SEO

- Semantic HTML structure
- Meta tags for social sharing
- Open Graph tags
- Structured data ready

## Analytics

Add Google Analytics or other tracking:
```html
<!-- Add to <head> section -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## License

MIT License - feel free to use and modify as needed. 