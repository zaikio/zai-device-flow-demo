import axios from "axios";
import qrCode from "qrcode-generator";
import Request from "axios-request-handler";

axios
  .post(
    process.env.DIRECTORY_HOST + "/oauth/device_authorizations/authorize.json",
    {
      client_id: process.env.DIRECTORY_OAUTH_CLIENT_ID,
      scope: "" // TODO
    }
  )
  .then(response => {
    // 1. Show QR Code
    console.log(response.data.verification_uri_complete);
    const qr = qrCode(0, "L");
    qr.addData(response.data.verification_uri_complete);
    qr.make();
    document.getElementById("user_code").innerHTML = response.data.user_code;
    document.getElementById("qr_code").innerHTML = qr.createImgTag(8);

    // 2. Start Polling
    const pollingRequest = new Request(
      process.env.DIRECTORY_HOST + "/oauth/access_token.json",
      {
        data: {
          client_id: process.env.DIRECTORY_OAUTH_CLIENT_ID,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          device_code: response.data.device_code
        },
        errorHandler: (error, method) => {
          console.log(error, method);
        }
      }
    );

    pollingRequest.poll(500).post(accessTokenResponse => {
      if (!accessTokenResponse) {
        return true;
      }
      const accessToken = accessTokenResponse.data.access_token;
      axios.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
      // TODO: 3. Create Machine
      return false; // stop polling
    });
  });
