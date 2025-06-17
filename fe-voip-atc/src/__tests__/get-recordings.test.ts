import { GET as handler } from "../app/api/recordings/channel/route";
import { db } from "../lib/db";
import { getSessionUser } from "../lib/auth";

jest.mock("../lib/db", () => ({
  db: {
    query: jest.fn(),
  },
}));

jest.spyOn(console, "error").mockImplementation(() => {});

jest.mock("../lib/auth", () => ({
  getSessionUser: jest.fn(),
}));

const mockedDb = db as unknown as {
  query: jest.Mock;
};
const mockedAuth = getSessionUser as jest.Mock;

describe("GET /api/recordings/channel", () => {
  it("should return recordings for authenticated user", async () => {
    mockedAuth.mockResolvedValue({ id: 1 });

    mockedDb.query.mockResolvedValueOnce([
      [
        {
          call_id: "ch123",
          caller_id: 1,
          channel: "6001",
          join_time: "2025-06-06T10:00:00Z",
          leave_time: "2025-06-06T10:10:00Z",
          recording_filename: "rec.wav",
          recording_s3_url: "https://example.com/rec.wav",
          log_activity_filename: "log.json",
          channel_name: "Tim Pagi",
          log_activity_s3_url: "https://example.com/log.json",
        },
      ]
    ]);

    const res = await handler();

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.length).toBe(1);
    expect(data[0].call_id).toBe("ch123");
    expect(data[0].channel_name).toBe("Tim Pagi");
    expect(data[0].duration_seconds).toBe(600); // 10 menit
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

    mockedDb.query.mockRejectedValue(new Error("DB error"));

    const res = await handler();

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.message).toBe("DB error");
  });
});
