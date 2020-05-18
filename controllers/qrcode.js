const QRCode = require('qrcode');
const pathLib = require('path');
const appDir = pathLib.dirname(require.main.filename) + "/..";

module.exports = {
  generate: async (req, res) => {
    if (!req.query["code"])
      res.status(401).send({error: {name: "Missing parameter 'code'"}});
    else {
      let path = "/qrcodes/";
      
      if (req.query["directory"])
        path += req.query["directory"];
      if (req.query["filename"])
        path += req.query["filename"];
      else
        path += req.query["code"];
      path += ".png";

      await QRCode.toFile(appDir + path, req.query["code"], function (err) {
        if (err) throw err
        console.log('done');
      });

      let filePath = "." + path
      let resolvedPath = pathLib.resolve(filePath);
      console.log(path);
      console.log(resolvedPath);
      res.redirect(path);
    }
  }
}