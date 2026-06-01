const jwt = require("jsonwebtoken");
const fs = require('fs');

const token = jwt.sign({ admin: true }, process.env.JWT_SECRET || "default_dev_secret_key");
console.log("Token:", token);

async function run() {
  const FormData = require('form-data');
  const form = new FormData();
  form.append('image', Buffer.from('test image data'), { filename: 'test.png', contentType: 'image/png' });

  try {
    const res = await fetch("http://localhost:3000/api/admin/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: form
    });
    console.log(res.status, await res.text());
  } catch (err) {
    console.error(err);
  }
}
run();
