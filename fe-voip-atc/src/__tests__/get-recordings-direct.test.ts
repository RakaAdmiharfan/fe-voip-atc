import { GET as handler } from "../app/api/recordings/private/route";
import { db } from "../lib/db";
import { getSessionUser } from "../lib/auth";

jest.mock("../lib/db", () => ({
  db: {
    execute: jest.fn(),
    query: jest.fn(), // in case needed
  },
}));

jest.mock("../lib/auth", () => ({
  getSessionUser: jest.fn(),
}));

jest.spyOn(console, "error").mockImplementation(() => {});

const mockedDb = db as unknown as {
  execute: jest.Mock;
  query: jest.Mock;
};
const mockedAuth = getSessionUser as jest.Mock;

describe("GET /api/recordings (direct call)", () => {
  it("should return recordings for authenticated user", async () => {
    mockedAuth.mockResolvedValue({ id: 1 });

    mockedDb.execute.mockResolvedValueOnce([
      [
        {
          call_id: "456",
          caller_id: 1,
          receiver_id: 2,
          start_time: "2025-01-01T12:00:00Z",
          end_time: "2025-01-01T12:05:00Z",
          recording_filename: "rec2.wav",
          recording_s3_url: "https://example.com/rec2.wav",
          status: "ANSWER",
          caller_username: "raka",
          receiver_username: "amjad",
        },
      ],
    ]);

    const res = await handler();

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBe(1);
    expect(data[0].display_name).toBe("amjad");
  });

  it("should return 401 if user not authenticated", async () => {
    mockedAuth.mockResolvedValue(null);

    const res = await handler();

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.message).toBe("Unauthorized");
  });

  it("should return 500 on database error", async () => {
    mockedAuth.mockResolvedValue({ id: 1 });

    mockedDb.execute.mockRejectedValue(new Error("DB error"));

    const res = await handler();

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.message).toBe("Internal server error");
  });
});
