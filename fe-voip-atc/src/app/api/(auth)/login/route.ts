import { NextRequest } from "next/server";
import { UserAgent, Registerer } from "sip.js"; // Import SIP.js for handling SIP registrations

// Assuming this is in the app directory
export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const AsteriskAmi = require("asterisk-ami");

  if (!username || !password) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Username dan password diperlukan",
      }),
      { status: 400 }
    );
  }

  const ami = new AsteriskAmi({
    host: "16.78.90.15", // Ganti dengan alamat Asterisk yang sesuai
    username: username, // Menggunakan username dari frontend
    password: password, // Menggunakan password dari frontend
  });

  return new Promise<Response>((resolve, reject) => {
    ami.connect(function () {
      console.log("Koneksi berhasil ke AMI");

      ami.send({ action: "Ping" }, async function (response: any) {
        console.log("Response Ping:", response);

        // After successful AMI connection and Ping response, proceed with SIP registration
        try {
          // Example SIP configuration; replace with your actual values
          const sipConfig = {
            username: username,
            domain: "16.78.90.15", // Replace with your domain
            wss: "wss://16.78.90.15:8088", // Replace with WebSocket URL for SIP
            password: password,
          };

          // Create the URI for SIP registration
          const uri = UserAgent.makeURI(
            `sip:${sipConfig.username}@${sipConfig.domain}`
          );
          if (!uri) {
            throw new Error("Invalid SIP URI");
          }

          // Check if the WebSocket URL is valid
          if (!sipConfig.wss) {
            throw new Error("Invalid WebSocket server URL");
          }

          // Create the SIP user agent for registration
          const userAgent = new UserAgent({
            uri: uri,
            transportOptions: { server: sipConfig.wss },
            authorizationUsername: sipConfig.username,
            authorizationPassword: sipConfig.password,
          });

          // Attempt to start the user agent connection
          await userAgent.start();

          // Check if the connection is successful
          if (!userAgent.isConnected()) {
            throw new Error("Failed to connect SIP UserAgent");
          }

          // Register the user agent with the SIP server
          const registerer = new Registerer(userAgent);
          await registerer.register();

          console.log("SIP User Agent Registered!");

          resolve(
            new Response(
              JSON.stringify({
                success: true,
                message: "Login berhasil dan SIP terdaftar",
              }),
              { status: 200 }
            )
          );
        } catch (error: any) {
          console.error("Error during SIP registration:", error);
          resolve(
            new Response(
              JSON.stringify({
                success: false,
                message: "Gagal melakukan registrasi SIP",
                error: error.message,
              }),
              { status: 500 }
            )
          );
        }
      });
    });

    // Handle socket errors
    ami.on("ami_socket_error", function (error: any) {
      console.error("Terjadi error di socket:", error);
      resolve(
        new Response(
          JSON.stringify({
            success: false,
            message: "Terjadi error saat koneksi ke AMI",
            error,
          }),
          { status: 500 }
        )
      );
    });
  });
}
