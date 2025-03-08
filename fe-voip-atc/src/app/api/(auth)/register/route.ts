import fetch from "node-fetch";

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    const amiUrl = "http://16.78.90.15:5038/ari/"; // Ganti dengan alamat Asterisk yang sesuai
    const amiUser = "admin"; // Nama pengguna AMI
    const amiPass = "admin"; // Kata sandi AMI

    // Kirimkan perintah untuk menambah pengguna baru di PJSIP melalui AMI
    const amiCommand = `Action: Originate
Channel: PJSIP/${username}
Context: default
Exten: 1000
Priority: 1
Timeout: 30000
CallerID: ${username}
Application: Dial
Data: PJSIP/${username}`;

    try {
      const response = await fetch(`http://16.78.90.15:5038/ami`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `Action: Login\r\nUsername: ${amiUser}\r\nSecret: ${amiPass}\r\n\r\n${amiCommand}`,
      });

      if (response.ok) {
        res.status(200).json({ message: "User registered successfully" });
      } else {
        res.status(400).json({ message: "Failed to register user" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
