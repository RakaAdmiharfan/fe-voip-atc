import { POST as handler } from "../app/api/channel/join/route";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

jest.mock("@/lib/db", () => ({
  db: {
    query: jest.fn(),
  },
}));
jest.mock("@/lib/auth", () => ({
  getSessionUser: jest.fn(),
}));
jest.spyOn(console, "error").mockImplementation(() => {});

const mockedDb = db as unknown as {
  query: jest.Mock;
};
const mockedAuth = getSessionUser as jest.Mock;

const mockReq = (body: any) =>
  ({
    json: async () => body,
  } as Request);

describe("POST /api/channels/join", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should join a public channel successfully", async () => {
    mockedAuth.mockResolvedValue({ id: 1 });

    // channel exists and is public
    mockedDb.query
      .mockResolvedValueOnce([[{ id: 10, is_private: 0 }]]) // SELECT channels
      .mockResolvedValueOnce([[]]) // SELECT channel_members
      .mockResolvedValueOnce([{}]); // INSERT channel_members

    const req = mockReq({ name: "general" });
    const res = await handler(req as any);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Joined channel successfully");
    expect(data.channelId).toBe(10);
  });

  it("should return 401 if not authenticated", async () => {
    mockedAuth.mockResolvedValue(null);
    const req = mockReq({ name: "general" });
    const res = await handler(req as any);
    expect(res.status).toBe(401);
  });

  it("should return 404 if channel not found", async () => {
    mockedAuth.mockResolvedValue({ id: 1 });
    mockedDb.query.mockResolvedValueOnce([[]]); // SELECT channels

    const req = mockReq({ name: "unknown" });
    const res = await handler(req as any);
    expect(res.status).toBe(404);
  });

  it("should return 403 if channel is private", async () => {
    mockedAuth.mockResolvedValue({ id: 1 });
    mockedDb.query.mockResolvedValueOnce([[{ id: 10, is_private: 1 }]]); // private channel

    const req = mockReq({ name: "private-room" });
    const res = await handler(req as any);
    expect(res.status).toBe(403);
  });

  it("should return 409 if user already joined", async () => {
    mockedAuth.mockResolvedValue({ id: 1 });

    mockedDb.query
      .mockResolvedValueOnce([[{ id: 10, is_private: 0 }]]) // SELECT channels
      .mockResolvedValueOnce([[{ id: 999 }]]); // SELECT channel_members (already joined)

    const req = mockReq({ name: "general" });
    const res = await handler(req as any);
    expect(res.status).toBe(409);
  });
});
