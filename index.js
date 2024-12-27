const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Route to fetch access token
app.post("/getAccessToken", async (req, res) => {
  try {
    const response = await axios.post(
      "https://dev.abdm.gov.in/gateway/v0.5/sessions",
      {
        clientId: "SBXID_008175", 
        clientSecret: "1fa1cd7f-a2bb-468b-b6c2-cc16d725cbdf", 
        grantType: "client_credentials",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "REQUEST-ID": uuidv4(),
          TIMESTAMP: new Date().toISOString(),
          "X-CM-ID": "sbx",
        },
      }
    );

    if (!response || !response.data || !response.data.accessToken) {
      console.error("Invalid token response:", response.data);
      res.status(400).send("Failed to fetch access token");
      return;
    }
    res.json({ accessToken: response.data.accessToken });
  } catch (error) {
    console.error("Error Response Data:", error.response?.data);
    console.error("Error Status Code:", error.response?.status);
    console.error("Error Headers:", error.response?.headers);
    res.status(500).send("Internal Server Error");
  }
});

// Route to generate Aadhaar OTP
app.post("/generateAadhaarOtp", async (req, res) => {
  try {
    const { accessToken, aadhaarNumber } = req.body;

    if (!accessToken || !aadhaarNumber) {
      return res
        .status(400)
        .send("AccessToken and Aadhaar Number are required.");
    }

    const response = await axios.post(
      "https://hpridsbx.abdm.gov.in/api/v1/registration/aadhaar/generateOtp",
      { aadhaar: aadhaarNumber },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Error generating OTP:",
      error.response?.data || error.message
    );
    res
      .status(error.response?.status || 500)
      .send(error.response?.data?.message || "Internal Server Error");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
