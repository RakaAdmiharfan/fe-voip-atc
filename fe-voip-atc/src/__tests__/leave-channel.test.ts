import { POST } from "@/app/api/channel/leave/route";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

jest.mock("@/lib/db", () => ({
  db: {
    query: jest.fn(),
  },
}));

jest.spyOn(console, "error").mockImplementation(() => {});


jest.mock("@/lib/auth", () => ({
  getSessionUser: jest.fn(),
}));

const mockRequest = (body: any) => ({
  json: () => Promise.resolve(body),
}) as any;

describe("POST /api/channel/leave", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);

    const res = await POST(mockRequest({ name: "General" }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("should return 400 if channel name is missing", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ id: 1 });

    const res = await POST(mockRequest({}));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Channel name is required" });
  });

  it("should return 404 if channel does not exist", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ id: 1 });
    (db.query as jest.Mock).mockResolvedValueOnce([[]]); // no channel found

    const res = await POST(mockRequest({ name: "Nonexistent" }));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Channel not found" });
  });

  it("should return 409 if user is not in the channel", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ id: 1 });

    (db.query as jest.Mock)
      .mockResolvedValueOnce([[{ id: 10 }]]) // channel found
      .mockResolvedValueOnce([[]]); // not a member

    const res = await POST(mockRequest({ name: "General" }));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "You are not in this channel" });
  });

  it("should successfully leave the channel", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ id: 1 });

    (db.query as jest.Mock)
      .mockResolvedValueOnce([[{ id: 10 }]]) // channel found
      .mockResolvedValueOnce([[{ id: 100 }]]) // membership found
      .mockResolvedValueOnce([{}]); // deletion ok

    const res = await POST(mockRequest({ name: "General" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: "Left channel successfully" });
  });

  it("should return 500 on unexpected error", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ id: 1 });
    (db.query as jest.Mock).mockRejectedValue(new Error("DB Error"));

    const res = await POST(mockRequest({ name: "Buggy" }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal Server Error" });
  });
});
