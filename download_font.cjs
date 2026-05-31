const https = require('https');
const fs = require('fs');
const unzipper = require('unzipper');

const url = 'https://public-assets.thmanyah.com/font/Thmanyah-Font-Family.zip';
const targetDir = 'public/fonts/thmanyah';

if (!fs.existsSync(targetDir)){
    fs.mkdirSync(targetDir, { recursive: true });
}

https.get(url, (response) => {
    response.pipe(unzipper.Extract({ path: targetDir }))
      .on('close', () => {
         console.log('Font extracted');
      });
});
