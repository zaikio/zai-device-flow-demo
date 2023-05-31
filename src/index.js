import axios from "axios";
import qrCode from "qrcode-generator";
import Request from "axios-request-handler";

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

axios
  .post(
    process.env.DIRECTORY_HOST + "/oauth/device_authorizations/authorize.json",
    {
      client_id: process.env.DIRECTORY_OAUTH_CLIENT_ID,
      scope: "Org.zaikio.machines.rw"
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
      console.log("accessToken", accessToken);
      // 3. Fetch site (orga needs at least one site!)
      axios
        .get(process.env.DIRECTORY_HOST + "/api/v1/sites.json")
        .then(siteResponse => {
          const siteId = siteResponse.data.length ? siteResponse.data[0].id : undefined;
          // 4. Create Machine
          axios
            .post(process.env.DIRECTORY_HOST + "/api/v1/machines.json", {
              machine: {
                site_id: siteId,
                name: "Speedmaster XL 106",
                manufacturer: "Heidelberger Druckmaschinen AG",
                serial_number: uuidv4(), // makes sure that we do not get a validation error if we create it multiple times
                kind: "digital_press"
              }
            })
            .then(machineResponse => {
              console.log("CREATED MACHINE");
              // 5. Take ownership of machine
              axios
                .post(
                  process.env.DIRECTORY_HOST +
                    "/api/v1/machines/" +
                    machineResponse.data.id +
                    "/machine_ownership.json"
                )
                .then(() => {
                  document.getElementById("user_code").innerHTML = "";
                  document.getElementById("qr_code").innerHTML =
                    "MACHINE CREATED!";
                });
            });
        });

      return false; // stop polling
    });
  });
