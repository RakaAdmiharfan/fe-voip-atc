import { POST } from "@/app/api/channel/create/route";
import { db } from "../lib/db";
import { getSessionUser } from "../lib/auth";

jest.mock("@/lib/db", () => ({
  db: {
    query: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => ({
  getSessionUser: jest.fn(),
}));

const mockRequest = (body: any) => ({
  json: () => Promise.resolve(body),
}) as any;

describe("POST /api/channel/create", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);

    const res = await POST(mockRequest({ name: "General", type: "public" }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("should return 400 if name is missing", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ id: 1 });

    const res = await POST(mockRequest({ type: "public" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Channel name is required" });
  });

  it("should return 409 if channel name already exists", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ id: 1 });
    (db.query as jest.Mock).mockResolvedValueOnce([[{ id: 1 }]]); // existing name

    const res = await POST(mockRequest({ name: "General" }));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Channel name already exists" });
  });

  it("should create a channel successfully", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ id: 1 });

    (db.query as jest.Mock)
      // no existing channel with the same name
      .mockResolvedValueOnce([[]])
      // max_suffix result
      .mockResolvedValueOnce([[{ max_suffix: 5 }]])
      // insert into channels returns insertId
      .mockResolvedValueOnce([{ insertId: 42 }])
      // insert into channel_members
      .mockResolvedValueOnce([{}]);

    const res = await POST(mockRequest({ name: "New Channel" }));
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.message).toBe("Channel created");
    expect(json.channelId).toBe(42);
    expect(json.number).toBe("6006");
  });

  it("should return 500 if there is an unexpected error", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ id: 1 });
    (db.query as jest.Mock).mockRejectedValue(new Error("DB Error"));

    const res = await POST(mockRequest({ name: "Channel X" }));
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBe("Internal Server Error");
  });
});
