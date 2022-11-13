require("dotenv").config();
const { google } = require("googleapis");
const credentials = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
    "base64"
  ).toString("ascii")
);
const scopes = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  scopes
);
const drive = google.drive({ version: "v3", auth });

(async () => {
  const path = require("path");
  const fileName = "exception_message_intellij.txt";
  const destination = require("fs").createWriteStream(
    path.join(__dirname, fileName)
  );
  const list = await drive.files.list({
    q: "name = '" + fileName + "'",
    orderBy: "createdTime asc",
  });

  drive.files.get(
    { fileId: list.data.files[0].id, alt: "media" },
    { responseType: "stream" },
    (err, res) => {
      res.data.on("error", () => console.log("Error : ", error));
      res.data.pipe(destination);
    }
  );
})();
