const express = require("express");
const assetsLinks = require("../.well-known/assetLinks.json");
const appleAppSite = require("../.well-known/apple-app-site-association.json");
const router = express.Router();
const { indexNonce } = require("../nounce");

const transparentPixel = Buffer.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
  0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00,
  0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
  0x44, 0x01, 0x00, 0x3b,
]);

router.get("/", (req, res) => {
  res.render("index", { nounce: indexNonce });
});

router.get("/terms-of-service", (req, res) => {
  res.render("terms", { nounce: indexNonce });
});

router.get("/privacy-policy", (req, res) => {
  res.render("privacy", { nounce: indexNonce });
});

router.get("/contact", (req, res) => {
  res.render("contact", { nounce: indexNonce });
});

router.get("/.well-known/assetlinks.json", (req, res) => {
  assetsLinks[0].target.package_name = process.env.PACKAGE_NAME;
  assetsLinks[0].target.sha256_cert_fingerprints = JSON.parse(
    process.env.SHA256,
  );
  /**
   * This is local flutter run sha256
   */
  assetsLinks[0].target.sha256_cert_fingerprints.push(
    "BA:18:A5:07:9B:AA:7C:4F:E0:29:3F:EB:5E:03:7D:4D:53:99:8B:37:D3:01:2B:B2:8B:38:CC:91:2E:BA:2D:32",
  );
  res.send(assetsLinks);
});

router.get("/.well-known/apple-app-site-association", (req, res) => {
  res.send(appleAppSite);
});

module.exports = router;
