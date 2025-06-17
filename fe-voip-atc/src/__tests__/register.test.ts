import { POST as handler } from "../app/api/(auth)/register/route";
import { db } from "../lib/db";

// Mock DB
jest.mock("../lib/db", () => ({
  db: {
    execute: jest.fn(),
  },
}));

describe("POST /api/register", () => {
  it("should register a user", async () => {
    const mockExecute = db.execute as jest.Mock;

    // 1. Username not found
    mockExecute.mockResolvedValueOnce([[]]); // SELECT * FROM users WHERE username = ?
    mockExecute.mockResolvedValueOnce([{ insertId: 1 }]); // INSERT INTO users ...
    mockExecute.mockResolvedValueOnce(undefined); // INSERT INTO user_settings
    mockExecute.mockResolvedValueOnce(undefined); // INSERT INTO ps_auths
    mockExecute.mockResolvedValueOnce(undefined); // INSERT INTO ps_aors
    mockExecute.mockResolvedValueOnce(undefined); // INSERT INTO ps_endpoints

    const req = {
      json: async () => ({
        username: "amjad",
        password: "testpass",
        email: "amjad@mail.com",
      }),
    } as Request;

    const res = await handler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("User registered successfully");
    expect(data.sipId).toBe("1");
  });

  it("should fail if username already exists", async () => {
    const mockExecute = db.execute as jest.Mock;
    mockExecute.mockReset();

    // 1. Username already exists
    mockExecute.mockResolvedValueOnce([[{ username: "Amjad" }]]); // SELECT * FROM users WHERE username = ?

    const req = {
      json: async () => ({
        username: "raka",
        password: "testpass",
        email: "raka@mail.com",
      }),
    } as Request;

    const res = await handler(req);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.message).toBe("Username already taken");
  });
});
