// Debug script to test Etsy scraping for the specific URL
const testUrl = 'https://www.etsy.com/listing/1708567730/lily-of-the-valley-glass-can-tumbler-may';

console.log('Testing Etsy URL:', testUrl);

// Simulate what our extraction function would find
const commonPricePatterns = [
  // Common patterns that might appear in Etsy HTML
  '"price":"19.95"',
  '"formatted_price":"$19.95"',
  '"currency_formatted_short":"$19.95"',
  'data-test-id="listing-price">$19.95',
  'class="price-display">$19.95',
  '$19.95',
  'US$19.95',
  'USD 19.95'
];

console.log('Expected patterns to look for:');
commonPricePatterns.forEach((pattern, i) => {
  console.log(`${i + 1}. ${pattern}`);
});

console.log('\nThe updated scraper should now handle these patterns correctly.');
console.log('If you test this URL, check the browser console for detailed logs.');